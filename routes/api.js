/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');

mongoose.connect(process.env.DB);
/*
let replySchema = mongoose.Schema({
  text: String,
  created_on: Date,
  reported: Boolean,
  delete_password: String,
});

let Reply = mongoose.model('Reply',replySchema,'Replies');
*/

function sortAndSlice(arr,sortField,howMany) {
  if (arr instanceof Array) 
    return arr
            .sort((a,b) => 
                  {
                    if (a[sortField] > b[sortField]) return -1 ;
                    else return +1 ;
                  }
                 )
            .slice(0,howMany) ;
  else 
    return -1 ;
}

let threadSchema = mongoose.Schema({
    text: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    delete_password: String,
    replies: [{text: String, 
               created_on: Date,
               reported: Boolean,
               delete_password: String
              }],
    board: String
});

let Thread = mongoose.model('Thread',threadSchema,'Threads');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function(req,res) {
      let board = req.params.board ;  
    
      //post thread to board
      let newThread = Thread({
        text: req.body.text,
        delete_password: req.body.delete_password,
        board: board,
        bumped_on: new Date(),
        created_on: new Date(),
        reported: false,
        replies: []
      });
    
      //save new thread
      newThread.save(function(err,doc) {
        if (err) return res.json({error: err}) ;
        else return res.redirect('/b/'+board + '/') ;
      });
    
    })
  
    .get(function(req,res) {
    
      Thread.find({board: req.params.board},function(err,docs) {
        if (err) return res.json({error: err});
        else {
          if (docs.length == 0) return res.json({});
          else {
                        
            return res.json(sortAndSlice(docs,'bumped_on',10)
                            
                              //extract the desired fields
                              .map(doc => ({
                                        text: doc.text,
                                        created_on: doc.created_on,
                                        bumped_on: doc.bumped_on,
                                        replies: sortAndSlice(doc.replies,'created_on',3)
                                                  .map(reply => ({text: reply.text, 
                                                                  created_on: reply.created_on,
                                                                  _id: reply._id
                                                                 })
                                                      ),
                                        replycount: doc.replies.length,
                                        _id: doc._id
                                        })
                                  )
                           );  
          }
        }
      });
    
    
    })
  
  
    .delete(function(req,res) {
      let thread_id = req.body.thread_id;
      let delete_password = req.body.delete_password ;
    
      Thread.findById(thread_id, function(err,doc){
        //console.log('found doc');
        //console.log(doc);
        if (err) return res.json({error: err});
        else if (doc == null) return res.json({result: 'could not find thread with thread_id = ' + thread_id}) ;
        else {
          Thread.deleteOne({_id: thread_id, delete_password: delete_password},function(err,doc) {
            //console.log(doc.n);
            //deleteOne returns doc.n = 0 when it doesn't find anything
            
            if (err) return res.json({error:err}) ;
            else if (doc.n == 0) return res.json({result: 'incorrect password'});
            else {
              return res.json({result:'success'});
            }
          }) ;
        }
        
      });
    
    })
  
    .put(function(req,res) {
      let report_id = req.body.report_id;
      
      Thread.findById(report_id, function(err,doc) {
        if (err) return res.json({error:err});
        else {
          doc.reported = true ;
          doc.save(function(err,thread) {
            if (err) return res.json({error:err});
            else return res.json({result:'success'});
          });
        }
      });
    });
  
    
  app.route('/api/replies/:board')
    .post(function(req,res) {
      let board = req.params.board ;
      let thread_id = req.body.thread_id;
    
      //post reply to board
      let newReply = {
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        reported: false
      };
    
      /*
      //save new reply
      newReply.save(function(err,doc) {
        if (err) return res.json({error: err}) ;
        else {
            
        }
      });*/
    
      //update replies array in thread
      Thread.findById(thread_id,function(err,doc) {
        if (err) return res.json({error:err});
        else {
          
          //update the replies array and bumped_on date
          doc.replies = doc.replies.concat([newReply]) ;
          doc.bumped_on = newReply.created_on ;
          
          //save updated thread
          doc.save(function(err,thread) {
            if (err) return res.json({error:err});
            else return res.redirect('/b/'+board + '/'+thread_id) ;
          });

          }
        });
    
      })
  
  
  .get(function(req,res) {
      let board = req.params.board ;
      let thread_id = req.query.thread_id;
      
      Thread.findById(thread_id,function(err,doc) {
        if (err) return res.json({error: err});
        else {
          //console.log(doc);
          if (doc == null) return res.json({});
          else {
            //console.log(doc);
            //return res.json(docs);
            return res.json({
              text: doc.text,
              created_on: doc.created_on,
              bumped_on: doc.bumped_on,
              replies: doc.replies.map(reply => ({
                                                  text: reply.text,
                                                  created_on: reply.created_on,
                                                  _id: reply._id
                                                })),
              _id: doc._id
            });  
          }
          //
        }
      });
    
    
    })
  
    .delete(function(req,res) {
      let thread_id = req.body.thread_id;
      let delete_password = req.body.delete_password ;
      let reply_id = req.body.reply_id ;
      //console.log(reply_id);
    
      Thread.findOne({_id: thread_id}, {replies: {$elemMatch:{_id: reply_id}}}, function(err,doc){
        //elemMatch gets the first element of array that matches condition
        
        if (err) return res.json({error: err});
        else {
          if (doc.replies[0].delete_password != delete_password) return res.json({result:'incorrect password'});
          else {
            doc.replies[0].text = '[deleted]' ;
            doc.save(function(err,thread) {
              if (err) return res.json({error: err});
              else return res.json({result:'success'});
            });
          }
        }
      })
    
    })
  
    .put(function(req,res) {
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id ;
      
      Thread.findOne({_id: thread_id}, {replies: {$elemMatch:{_id: reply_id}}}, function(err,doc) {
        if (err) return res.json({error:err});
        else {
          doc.replies[0].reported = true ;
          doc.save(function(err,thread) {
            if (err) return res.json({error:err});
            else return res.json({result:'success'});
          });
        }
      });
    });

};
