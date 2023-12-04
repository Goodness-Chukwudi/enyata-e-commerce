import {Model, HydratedDocument, ClientSession, ObjectId} from "mongoose";
import { ITEM_STATUS } from "../common/constants/app_constants";
import { MongoId } from "../interfaces/types";
import { MultipleSave, TransactionData, TransactionResult } from "../interfaces/interfaces";
import { appInstance } from "../App";

/**
 * An abstract class that provides methods for performing DB queries.
 * Classes(entity service classes mostly) that extends this class:
 * - provide the interface of the mongoose document schema
 * - provide the mongoose model in the constructor
 * - inherit it's database access methods
 * @param Model A mongoose document model on which the query is performed
 * @param T interface of the document schema
*/

abstract class DBService<T> {

    client = appInstance?.dbClient;
    private readonly populatedFields:string[]|Record<string,string>[];
    private readonly table_name:string;

    constructor(tableName:string, populatedPaths:string[]|Record<string,string>[]) {
        this.table_name = tableName;
        this.populatedFields = populatedPaths;

    }

    /**
     * Performs an insert query for the provided data.
     * @param data data of type object to be saved
     * @returns  A promise resolving to the result of type T of the performed query
    */
    public save(data: object): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const fields = Object.keys(data).join();
                const values = Object.values(data).join();
    
                const queryText = `
                    INSERT INTO ${this.table_name}(${fields})
                    VALUES(${values})
                    RETURNING *
                    `
                const response = await this.client.query(queryText);
                
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
    public saveWithTransaction(data: TransactionData[]): Promise<TransactionResult> {

        return new Promise(async (resolve, reject) => {
            try {
    
                let response:TransactionResult;

                await this.client.query('BEGIN')
    
                for (const item of data) {
                    const fields = Object.keys(item.data).join();
                    const values = Object.values(item.data).join();
      
                    const queryText = `
                        INSERT INTO ${item.name}(${fields})
                        VALUES(${values})
                        RETURNING *
                        `
                    const res = await this.client.query(queryText);
                    
                    response.name = item.name;
                    response.data = res.rows[0];
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
     * Performs update or insert queries accordingly for the provided data in a transaction.
     * @param data data of type TransactionData to be saved
     * @returns  A promise resolving to TransactionResult containing the result of the performed queries
    */
    public saveAndUpdateWithTransaction(data: TransactionData[]): Promise<TransactionResult> {

        return new Promise(async (resolve, reject) => {
            try {
    
                let response:TransactionResult;

                await this.client.query('BEGIN')
    
                for (const item of data) {
                    if (item.queryType == "save") {
                        const fields = Object.keys(item.data).join();
                        const values = Object.values(item.data).join();
          
                        const queryText = `
                            INSERT INTO ${item.name}(${fields})
                            VALUES(${values})
                            RETURNING *
                            `
                        const res = await this.client.query(queryText);
                        
                        response.name = item.name;
                        response.data = res.rows[0];
                    } else {

                        const WHERE = "WHERE " + item.condition;
                        let update = "";
                        for (const key in item.data) {
                            update += `${key} = ${item.data[key]},`
                        }
                        
                        const queryText = `
                            UPDATE ${item.name}
                            SET ${update}
                            ${WHERE}
                            RETURNING *
                        `
                        const res = await this.client.query(queryText);
                        
                        response.name = item.name;
                        response.data = res.rows;
                    }
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
    public saveMany(data:MultipleSave): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const fields = data.fields.join();
                let valuePlaceHolders = "";
                data.values[0].forEach(value => { valuePlaceHolders += "$1" })
    
                const queryText = `
                    INSERT INTO ${this.table_name}(${fields})
                    VALUES(${valuePlaceHolders})
                    RETURNING *
                    `
                const response = await this.client.query(queryText, data.values);
                
                resolve(response.rows[0]);
            } catch (error) {
                resolve(error);
            } finally {
                this.client.release();
            }
        })
    }

    /**
     * Counts the number of documents that matches the provided filter
     * @param query A mongoose query to match a document
     * @returns  A promise resolving to the number of matches found
    */
    /**
     * Counts the number of rows that matches the provided filter
     * @param fields optional columns to be selected
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @param groupBy options to be applied to the GROUP_BY part of the sql query
     * @param having options to be applied to the HAVING part of the sql query
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
    public count(fields = "*", condition = "", column = "", groupBy = "", having = ""): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                const COUNT = `COUNT (${column})`;
                const GROUP_BY = "GROUP BY " + groupBy;
                const HAVING = "HAVING " + having;
                
                const queryText = `
                    SELECT ${fields}
                    ${COUNT}
                    FROM ${this.table_name}
                    ${WHERE}
                    ${GROUP_BY}
                    ${HAVING}
                    RETURNING *
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
    public find(fields = "*", condition = "", groupBy = "", having = "", sort = "", pageSize = 5, page = 1): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                const GROUP_BY = "GROUP BY " + groupBy;
                const HAVING = "HAVING " + having;
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
                    RETURNING *
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
    public findOne(fields = "*", condition = "", groupBy = "", having = "", sort = "", pageSize = 5, page = 1): Promise< T > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                const GROUP_BY = "GROUP BY " + groupBy;
                const HAVING = "HAVING " + having;
                const ORDER_BY = sort || "ORDER BY created_at DESC";
                
                const queryText = `
                    SELECT ${fields}
                    FROM ${this.table_name}
                    ${WHERE}
                    ${GROUP_BY}
                    ${HAVING}
                    ${ORDER_BY}
                    RETURNING *
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
                    WHERE id = ${id}
                    RETURNING *
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
     * Updates the specified columns in the rows from the specified table, matching the provided filter
     * @param data the update to be made
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @returns  A promise resolving to a list of data of type T[] that matches the filter
    */
    public update(data: object, condition = ""): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                let update = "";
                for (const key in data) {
                    update += `${key} = ${data[key]},`
                }        

                const queryText = `
                    UPDATE ${this.table_name}
                    SET ${update}
                    ${WHERE}
                    RETURNING *
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
     * Updates the specified columns in the row from the specified table, matching the provided filter
     * @param data the update to be made
     * @param condition conditions to be applied to the WHERE part of the sql query
     * @returns  A promise resolving to a list of data of type T that matches the filter
    */
    public updateOne(data: object, condition = ""): Promise< T[] > {
        //@ts-ignore
        return new Promise(async (resolve, reject) => {
            try {
                const WHERE = "WHERE " + condition;
                let update = "";
                for (const key in data) {
                    update += `${key} = ${data[key]},`
                }
                
                const queryText = `
                    UPDATE ${this.table_name}
                    SET ${update}
                    ${WHERE}
                    RETURNING *
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
}

export default DBService;