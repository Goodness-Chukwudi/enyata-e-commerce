import { PoolClient } from "pg";
import { IDbQuery, PopulateTables } from "../interfaces/interfaces";
import pool from "../common/utils/db-pool";

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
    
    private readonly table_name:string;

    constructor(tableName:string) {
        this.table_name = tableName;
    }

    /**
     * Performs an insert query for the provided data.
     * @param data data of type object to be saved
     * @param transaction an optional db transaction
     * @returns  A promise resolving to the result of type T of the performed query
    */
    public save(data: Record<string, any>, transaction?: PoolClient): Promise<T> {
        return new Promise(async (resolve, reject) => {
            const client = transaction || await pool.connect();
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
                console.log(queryText)
                const response = await client.query(queryText, values);
                resolve(response.rows[0]);
            } catch (error) {
                reject (error);
            } finally {
                if (!transaction) client.release();
            }
        })
    }

    /**
     * Performs an insert query for the provided data in a db transaction.
     * @param data data of type object to be saved
     * @returns  A promise resolving to the result of type T of the performed query
    */
    // public saveWithTransaction(data: Record<string, number|boolean|string>, client: PoolClient): Promise<T> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const fields = Object.keys(data).join();
    //             const values = Object.values(data);
    //             let valueParams = "";
    //             values.forEach((value, i) => { 
    //                 let num = "";
    //                 num += i+1 == values.length ? i+1 + "" : i+1 + ",";
    //                 valueParams += "$" + num;
    //             })

    //             const queryText = `
    //                 INSERT INTO ${this.table_name}(${fields})
    //                 VALUES(${valueParams})
    //                 RETURNING *
    //                 `
    //             const response = await client.query(queryText, values);
                
    //             resolve(response.rows[0]);
    //         } catch (error) {
    //             reject(error);
    //         }
    //     })
    // }

    /**
     * Performs an insert query for multiple values in the provided data.
     * @param data data of type object to be saved
     * @param transaction an optional db transaction
     * @returns  A promise resolving to the result of type T of the performed query
    */
        public saveMany(data: Record<string, any>[], transaction?: PoolClient): Promise<T[]> {
            return new Promise(async (resolve) => {
                const client = transaction || await pool.connect();
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
                    console.log(queryText)
                    const response = await client.query(queryText, inputs);
                    
                    resolve(response.rows);
                } catch (error:any) {
                    resolve(error);
                } finally {
                    if (!transaction) client.release();
                }
            })
        }
        
    /**
     * Fetches all data from the specified table, matching the provided filter
     * @param fields optional columns to be selected
     * @param query an object containing parametrized WHERE conditions and and an array of their corresponding values
     * - condition conditions to be applied to the WHERE part of the sql query
     * - values the corresponding values for the conditions
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @param sort options to be applied to the ORDER_BY part of the sql query
     * @param pageSize options to be applied to the LIMIT part of the sql query
     * @param page options to be applied to the OFFSET part of the sql query
     * @param transaction an optional db transaction
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
    public find( query:IDbQuery|undefined = undefined, fields = "*", groupBy = "", having = "", sort = "", pageSize = 5, page = 1, transaction?: PoolClient): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            const client = transaction || await pool.connect();
            try {
                const WHERE = query?.condition ? "WHERE " + query.condition : "";
                const GROUP_BY = groupBy ? "GROUP BY " + groupBy : "";
                const HAVING = having ? "HAVING " + having : "";
                const ORDER_BY = sort || "ORDER BY created_at DESC";
                const LIMIT = page && pageSize ? `LIMIT ${pageSize} OFFSET ${(page -1)*pageSize}` : "";
                
                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    ${WHERE}
                    ${GROUP_BY}
                    ${HAVING}
                    ${ORDER_BY}
                    ${LIMIT}
                `
                console.log(queryText)
                const response = await client.query(queryText, query?.values || []);
                resolve(response.rows);
            } catch (error) {
                reject(error);
            } finally {
                if(!transaction) client.release()
            }
        });
    }

    /**
     * Fetches a single row from table, matching the provided filter
     * @param fields optional columns to be selected
     * @param query an object containing parametrized WHERE conditions and and an array of their corresponding values
     * - condition conditions to be applied to the WHERE part of the sql query
     * - values the corresponding values for the conditions
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @param sort options to be applied to the ORDER_BY part of the sql query
     * @param transaction an optional db transaction
     * @returns  A promise resolving to  data of type T that matches the filter
    */
    public findOne( query:IDbQuery|undefined = undefined , fields = "*", groupBy = "", having = "", sort = "", transaction?:PoolClient): Promise< T > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            
            const client = transaction || await pool.connect();
            try {
                const WHERE = query?.condition ? "WHERE " + query.condition : "";
                const GROUP_BY = groupBy ? "GROUP BY " + groupBy : "";
                const HAVING = having ? "HAVING " + having : "";
                const ORDER_BY = sort || `ORDER BY ${this.table_name}.created_at DESC`;
                
                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    ${WHERE}
                    ${GROUP_BY}
                    ${HAVING}
                    ${ORDER_BY}
                `
                console.log(queryText)
                const response = await client.query(queryText, query?.values || []);
                resolve(response.rows[0]);
            } catch (error) {
                reject(error);
            } finally {
                if (!transaction) client.release()
            }
        });
    }

    /**
     * Fetches a single row from table, matching the provided id
     * @param fields optional columns to be selected
     * @param transaction an optional db transaction
     * @returns  A promise resolving to  data of type T that matches the id
    */
    public findById(id: number, fields = "*", transaction?: PoolClient): Promise< T > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            const client = transaction || await pool.connect();
            try {

                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    WHERE id = $1
                `
                console.log(queryText)
                const response = await client.query(queryText, [id]);
                resolve(response.rows[0]);
            } catch (error) {
                reject(error);
            } finally {
                if(!transaction) client.release()
            }
        });
    }

    /**
     * Counts the number of rows that matches the provided filter
     * @param query an object containing parametrized WHERE conditions and and an array of their corresponding values
     * - condition conditions to be applied to the WHERE part of the sql query
     * - values the corresponding values for the conditions
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @param transaction an optional db transaction
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
        public count( query:IDbQuery|undefined = undefined, column = "", groupBy = "", having = "", transaction?:PoolClient): Promise< number > {
            //@ts-ignore
            return new Promise(async (resolve, reject) => {
                const client = transaction || await pool.connect();
                try {
                    const WHERE = query?.condition ? "WHERE " + query.condition : "";
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
                    console.log(queryText)
                    const response = await client.query(queryText, query?.values || []);
                    resolve(response.rows[0]?.count);
                } catch (error) {
                    reject(error);
                } finally {
                    if (!transaction) client.release()
                }
            });
        }

    /**
     * Updates the specified columns in the rows from the specified table, matching the provided filter
     * @param data the update to be made
    * @param query an object containing parametrized WHERE conditions and and an array of their corresponding values
     * - condition conditions to be applied to the WHERE part of the sql query
     * - values the corresponding values for the conditions
     * @param transaction an optional db transaction
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
    public update( query:IDbQuery|undefined = undefined, data: Record<string, any>, transaction?: PoolClient): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            const client = transaction || await pool.connect();
            try {
                const WHERE = query?.condition ? "WHERE " + query.condition : "";
                let valueParams = "";
                let i = query?.values.length ? query.values.length + 1 : 1;
                const firstParam = i;
                const values = query?.values || [];
                values.push(...Object.values(data));
                for (const key in data) {
                    const prefix =  i == firstParam ? "" : ",";
                    valueParams += prefix + `${key} =` + "$" + i;
                    i++;
                } 

                const queryText = `
                    UPDATE ${this.table_name}
                    SET ${valueParams}
                    ${WHERE}
                    RETURNING *
                `
                console.log(queryText)
                const response = await client.query(queryText, values);
                resolve(response.rows);
            } catch (error) {
                reject(error);
            } finally {
                if(!transaction) client.release()
            }
        });
    }

    /**
     * Updates the specified columns in the row from the specified table, matching the provided filter
     * @param data the update to be made
     * @param query an object containing parametrized WHERE conditions and and an array of their corresponding values
     * - condition conditions to be applied to the WHERE part of the sql query
     * - values the corresponding values for the conditions
     * @param transaction an optional db transaction
     * @returns  A promise resolving to a list of data of type T that matches the filter
    */
    public updateOne(query:IDbQuery|undefined = undefined, data: Record<string, any>, transaction?: PoolClient): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            const client = transaction || await pool.connect();
            try {
                const WHERE = query?.condition ? "WHERE " + query.condition : "";
                let valueParams = "";
                let i = query?.values.length ? query.values.length + 1 : 1;
                const firstParam = i;
                const values = query?.values || [];
                values.push(...Object.values(data));

                for (const key in data) {
                    const prefix =  i == firstParam ? "" : ",";
                    valueParams += prefix + `${key} =` + "$" + i;
                    i++;
                } 

                const queryText = `
                    UPDATE ${this.table_name}
                    SET ${valueParams}
                    ${WHERE}
                    RETURNING *
                `
                console.log(queryText)
                const response = await client.query(queryText, values);
                resolve(response.rows[0]);
            } catch (error) {
                reject(error);
            } finally {
                if(!transaction) client.release()
            }
        });
    }
}

export default DBService;