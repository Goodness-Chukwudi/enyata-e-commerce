
// import { Pool } from 'pg'
// import { TransactionData, TransactionResult } from "../interfaces/interfaces";
// const pool = new Pool()

// const client = await pool.connect();
// /**
//  * An abstract class that provides methods for performing DB queries.
//  * Classes(entity service classes mostly) that extends this class:
//  * - provide the interface of the mongoose document schema
//  * - provide the mongoose model in the constructor
//  * - inherit it's database access methods
//  * @param Model A mongoose document model on which the query is performed
//  * @param T interface of the document schema
// */
// class DbTransactionService {

//     constructor() {
//     }



//     public saveInTransactions(data: TransactionData[]): Promise<TransactionResult> {

//         return new Promise(async (resolve, reject) => {
//             try {
    
//                 let response:TransactionResult;

//                 await client.query('BEGIN')
    
//                 for (const item of data) {
//                     const fields = Object.keys(item.data).join();
//                     const values = Object.values(item.data);
//                     let valuePlaceHolders = "";
//                     values.forEach(value => { valuePlaceHolders += "$1"})
      
//                     const queryText = `INSERT INTO ${item.name}(${fields}) VALUES(${valuePlaceHolders}) RETURNING *`
//                     const res = await client.query(queryText, values);
                    
//                     response.name = item.name;
//                     response.data = res;
//                   }
    
//                 await client.query('COMMIT');
//                 client.release();
//                 resolve(response);
    
//             } catch (error) {
//                 await client.query('ROLLBACK');
//                 client.release();
//                 reject(error);
//             }

//         })

//     }
// }

// export default DbTransactionService;