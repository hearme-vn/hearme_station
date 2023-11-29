import { Injectable } from '@angular/core';
/* 
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
 */
declare var window : any;

@Injectable()
export class SqliteProvider {
    
    public rating : string = "";
    public comment : string = "";
    public created : string = "";
    public grp_id : string = "";
    public sur_id : string = "";
    public db = null;
    public arr = [];
    
    constructor() { }
    
    /**
    * Open The Datebase
    */
    openDb() {
        if (!window.sqlitePlugin)   return;
        
        document.addEventListener('deviceready', function() {
            this.db = window.sqlitePlugin.openDatabase(
                {
                    name: 'messages.db', 
                    location: 'default',
                    androidDatabaseProvider: 'system'
                }
            );
            this.db
                .transaction((tx) => {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS Messages (id integer primary key, type integer, payload text, status integer, created text)');
                }, (e) => {
                    console.log('Transtion Error', e);
                }, () => {
                    //console.log('Feedback Database OK..');
                })    
        }.bind(this))
    }
    
    /**
    * Add message, include feedback and event log
    * @param type: type of message
    *   - 0: for feedback message
    *   - 1: for event log message
    */
    addMessage(type, payload, status, created) {
        return new Promise(resolve => {
            if (!this.db) {
                resolve(false);
                return
            }          
            var InsertQuery = "INSERT INTO Messages (type, payload, status, created) VALUES (?, ?, ?, ?)";
            this.db.executeSql(InsertQuery, [type, payload, status, created], 
                (r) => {
                    console.log('Inserted... Sucess..');
                }, e => {
                    console.log('Inserted Error', e);
                    resolve(false);
            })
        })
    }    
    //Refresh everytime
    getRows(row) {
        return new Promise(resolve => {
            if (!this.db) {
                resolve(false);
                return
            }          
            
            this.arr = [];
            let query = "SELECT * FROM Messages WHERE (status=0) OR (status>=500) LIMIT " + row;
            this.db.executeSql(query, [], rs => {
                    if (rs.rows.length > 0) {
                        for (var i = 0; i < rs.rows.length; i++) {
                            var item = rs.rows.item(i);
                            this.arr.push(item);
                        }
                    }
                    resolve(true);
                }, (e) => {
                //console.log('Sql Query Error', e);
                });
            })
    }
    
    getRow() {
        return new Promise(resolve => {
            if (!this.db) {
                resolve(false);
                return
            }          
            
            this.arr = [];
            let query = "SELECT * FROM Messages WHERE (status=0) OR (status>=500) LIMIT 1";
            this.db.executeSql(query, [], rs => {
                if (rs.rows.length > 0) {
                    var item = rs.rows.item(0);
                    this.arr.push(item);
                }
                resolve(true);
            }, (e) => {
                console.log('Sql Query Error', e);
            });
        })
    }
    
    //to delete any Item
    del(id) {
        return new Promise(resolve => {
            if (!this.db) {
                resolve(false);
                return
            }          
            
            var query = "DELETE FROM Messages WHERE id=?";
            this.db.executeSql(query, [id], (s) => {
                    // console.log('Delete Success...', id);
                }, (err) => {
                    console.log('Deleting Error', err);
                });
            })
    }
/*     
    //to Update any Item
    update(id, txt) {
        return new Promise(res => {
            var query = "UPDATE Messages SET comment=? WHERE id=?";
            this.db.executeSql(query, [txt, id], (s) => {
                //console.log('Update Success...', s);
                }, (err) => {
                //console.log('Updating Error', err);
                });
            })
    }
 */    
}
