import { TransactionData, TransactionResult } from "../interfaces/interfaces";
import { appInstance } from "../App";

/**
 * An abstract class that provides methods for performing DB queries.
 * Classes(entity service classes mostly) that extends this class:
 * - provide the interface of the database model schema
 * - provide the table name of the table on which the query is to be performed
 * - inherit it's database access methods
 * @param tableName The table name of the table on which the query is to be performed
 * @param T interface of the database model schema
*/

abstract class DBService<T> {

    client = appInstance?.dbClient;
    private readonly table_name:string;

    constructor(tableName:string) {
        this.table_name = tableName;
    }

    /**
     * Performs an insert query for the provided data.
     * @param data data of type object to be saved
     * @returns  A promise resolving to the result of type T of the performed query
    */
    public save(data: Record<string, number|boolean|string>): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const fields = Object.keys(data).join();
                const values = Object.values(data);
                let valueParams = "";
                values.forEach((value, i) => { 
                    let num = "";
                    num += i+1 == values.length ? i+1 + "" : i+1 + ",";
                    valueParams += "$" + num;
                })

                const queryText = `
                    INSERT INTO ${this.table_name}(${fields})
                    VALUES(${valueParams})
                    RETURNING *
                    `
                const response = await this.client.query(queryText, values);
                
                resolve(response.rows[0]);
            } catch (error) {
                reject (error);
            } finally {
                this.client.release();
            }
        })
    }

    /**
     * Performs insert queries for the provided data in a transaction.
     * @param data data of type TransactionData to be saved
     * @returns  A promise resolving to TransactionResult containing the result of the performed queries
    */
    public saveWithTransaction(data: TransactionData[]): Promise<TransactionResult[]> {

        return new Promise(async (resolve, reject) => {
            try {
    
                const response:TransactionResult[] = [];

                await this.client.query('BEGIN')

                for (const item of data) {
                    const fields = Object.keys(item.data).join();
                    const values = Object.values(item.data);
                    let valueParams = "";
                    values.forEach((value, i) => { 
                        let num = "";
                        num += i+1 == values.length ? i+1 + "" : i+1 + ",";
                        valueParams += "$" + num;
                    })

                    const queryText = `
                        INSERT INTO ${item.name}(${fields})
                        VALUES(${valueParams})
                        RETURNING *
                        `
                    const res = await this.client.query(queryText, values);

                    response.push({
                        name: item.name,
                        data: res.rows[0]
                    })
                }

                await this.client.query('COMMIT');
                resolve(response);
    
            } catch (error) {
                await this.client.query('ROLLBACK');
                reject(error);
            } finally {
                this.client.release();
            }
        })
    }

        /**
     * Performs an insert query for multiple values in the provided data.
     * @param data data of type object to be saved
     * @returns  A promise resolving to the result of type T of the performed query
    */
        public saveMany(data: Record<string, number|boolean|string>[]): Promise<T[]> {
            return new Promise(async (resolve) => {
                try {
    
                    let fields;
                    let valueParams = "";
                    const inputs:any[] = [];
                    let lastCount = 0;
    
                    data.forEach((value, k) => { 
                        let prefix = ", "
                        if (k == 0) {
                            fields = Object.keys(value).join();
                            prefix = "";
                        }
    
                        let params = "";
                        const valueItems = Object.values(value);
                        const dataLength = valueItems.length;
    
                        valueItems.forEach((item, i) => {
                            const j = lastCount+i+1
    
                            let num = "";
                            if (i+1 == dataLength) {
                                num += j + "";
                                lastCount = j
                            } else {
                                num += j + ",";
                            }
                            params += "$" + num;
                        })
                        valueParams += `${prefix}(${params})`;
                        inputs.push(...valueItems);
                    })
        
                    const queryText = `
                        INSERT INTO ${this.table_name}(${fields})
                        VALUES ${valueParams}
                        RETURNING *
                        `
                    const response = await this.client.query(queryText, inputs);
                    
                    resolve(response.rows);
                } catch (error:any) {
                    resolve(error);
                } finally {
                    this.client.release();
                }
            })
        }
        
    /**
     * Fetches all data from the specified table, matching the provided filter
     * @param fields optional columns to be selected
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @param sort options to be applied to the ORDER_BY part of the sql query
     * @param pageSize options to be applied to the LIMIT part of the sql query
     * @param page options to be applied to the OFFSET part of the sql query
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
    public find( condition = "", fields = "*", groupBy = "", having = "", sort = "", pageSize = 5, page = 1): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = condition ? "WHERE " + condition : "";
                const GROUP_BY = groupBy ? "GROUP BY " + groupBy : "";
                const HAVING = having ? "HAVING " + having : "";
                const ORDER_BY = sort || "ORDER BY created_at DESC";
                const LIMIT = `LIMIT ${pageSize} OFFSET ${page}`;
                
                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    ${WHERE}
                    ${GROUP_BY}
                    ${HAVING}
                    ${ORDER_BY}
                    ${LIMIT}
                `
                const response = await this.client.query(queryText);
                resolve(response.rows);
            } catch (error) {
                reject(error);
            } finally {
                this.client.release()
            }
        });
    }

    /**
     * Fetches a single row from table, matching the provided filter
     * @param fields optional columns to be selected
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @param sort options to be applied to the ORDER_BY part of the sql query
     * @returns  A promise resolving to  data of type T that matches the filter
    */
    public findOne( condition = "", fields = "*", groupBy = "", having = "", sort = ""): Promise< T > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = condition ? "WHERE " + condition : "";
                const GROUP_BY = groupBy ? "GROUP BY " + groupBy : "";
                const HAVING = having ? "HAVING " + having : "";
                const ORDER_BY = sort || "ORDER BY created_at DESC";
                
                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    ${WHERE}
                    ${GROUP_BY}
                    ${HAVING}
                    ${ORDER_BY}
                `
                const response = await this.client.query(queryText);
                resolve(response.rows[0]);
            } catch (error) {
                reject(error);
            } finally {
                this.client.release()
            }
        });
    }

    /**
     * Fetches a single row from table, matching the provided id
     * @param fields optional columns to be selected
     * @returns  A promise resolving to  data of type T that matches the id
    */
    public findById(id: number, fields = "*"): Promise< T > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                
                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    WHERE id = $1
                `
                const response = await this.client.query(queryText, [id]);
                resolve(response.rows[0]);
            } catch (error) {
                reject(error);
            } finally {
                this.client.release()
            }
        });
    }

    /**
     * Counts the number of rows that matches the provided filter
     * @param fields optional columns to be selected
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
        public count( condition = "", fields = "*", column = "", groupBy = "", having = ""): Promise< number > {
            //@ts-ignore
            return new Promise(async (resolve, reject) => {
                try {
                    const WHERE = condition ? "WHERE " + condition : "";
                    const COUNT = column ? `COUNT (${column})` : 'COUNT (*)';
                    const GROUP_BY = groupBy ? "GROUP BY " + groupBy : "";
                    const HAVING = having ? "HAVING " + having : "";
                    
                    const queryText = `
                        SELECT
                        ${COUNT}
                        FROM ${this.table_name}
                        ${WHERE}
                        ${GROUP_BY}
                        ${HAVING}
                    `
                    const response = await this.client.query(queryText);
                    resolve(response.rows[0]?.count);
                } catch (error) {
                    reject(error);
                } finally {
                    this.client.release()
                }
            });
        }

    /**
     * Updates the specified columns in the rows from the specified table, matching the provided filter
     * @param data the update to be made
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
    public update(data: Record<string, number|boolean|string>, condition = ""): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                let valueParams = "";
                let i = 1;
                const values = Object.values(data);
                for (const key in data) {
                    const prefix =  i == 1 ? "" : ",";
                    valueParams += prefix + `${key} =` + "$" + i;
                    i++;
                } 

                const queryText = `
                    UPDATE ${this.table_name}
                    SET ${valueParams}
                    ${WHERE}
                    RETURNING *
                `
                const response = await this.client.query(queryText, values);
                resolve(response.rows);
            } catch (error) {
                reject(error);
            } finally {
                this.client.release()
            }
        });
    }

    /**
     * Updates the specified columns in the row from the specified table, matching the provided filter
     * @param data the update to be made
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @returns  A promise resolving to a list of data of type T that matches the filter
    */
    public updateOne(data: Record<string, number|boolean|string>, condition = ""): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                let valueParams = "";
                let i = 1;
                const values = Object.values(data);
                for (const key in data) {
                    const prefix =  i == 1 ? "" : ",";
                    valueParams += prefix + `${key} =` + "$" + i;
                    i++;
                } 

                const queryText = `
                    UPDATE ${this.table_name}
                    SET ${valueParams}
                    ${WHERE}
                    RETURNING *
                `
                const response = await this.client.query(queryText, values);
                resolve(response.rows[0]);
            } catch (error) {
                reject(error);
            } finally {
                this.client.release()
            }
        });
    }
}

export default DBService;