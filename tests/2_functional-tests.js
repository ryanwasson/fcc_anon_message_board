/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var exampleThreadId = '' ;
var exampleReplyId = '' ;

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board (excluding DELETE)', function() {
    
    suite('POST', function() {
      test('Test POST for testBoard',function(done){
        chai.request(server)
        .post('/api/threads/testBoard')
        .send({
          text:'testing POST',
          delete_password:'test'
        })
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.req.path,'/b/testBoard/');
          done();
        })
      });
    });
    
    suite('GET', function() {
      test('Test GET for testBoard',function(done){
        chai.request(server)
        .get('/api/threads/testBoard')
        .end(function(err,res){
          assert.equal(res.status,200);
          //console.log(res.body);
          
          assert.isArray(res.body);
          assert.isAtMost(res.body.length,10,'Returned array has at most 10 elements');
          
          assert.property(res.body[0],'text','Returned array element should have text property');
          assert.property(res.body[0],'created_on','Returned array element should have created_on property');
          assert.property(res.body[0],'bumped_on','Returned array element should have bumped_on property');
          //console.log('checking replies') ;
          
          assert.property(res.body[0],'replies','Returned array element should have replies property');
          assert.isArray(res.body[0].replies,'Replies property should be an array');
          assert.isAtMost(res.body[0].replies.length,3,'There should be at most 3 replies');
          /*assert.property(res.body[0].replies[0],'text','Each reply should have a text property');
          assert.property(res.body[0].replies[0],'created_on','Each reply should have a created_on property');
          assert.property(res.body[0].replies[0],'_id','Each reply should have a _id property');*/
          
          assert.property(res.body[0],'replycount','Returned array element should have replycount property');
          assert.property(res.body[0],'_id','Returned array element should have _id property');
          
          exampleThreadId = res.body[0]._id ;
          
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('Test PUT for testBoard',function(done){
        chai.request(server)
        .put('/api/threads/testBoard')
        .send({
          report_id: exampleThreadId
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.body.result,'success');
          done();
        })
      });
    });
  

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Test POST (replies) for testBoard',function(done){
        chai.request(server)
        .post('/api/replies/testBoard')
        .send({
          thread_id: exampleThreadId,
          text: 'test reply',
          delete_password: 'test'
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.req.path,'/b/testBoard/'+exampleThreadId);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('Test GET (replies) for testBoard',function(done){
        chai.request(server)
        .get('/api/replies/testBoard')
        .query({
          thread_id: exampleThreadId
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          
          //top level properties
          assert.property(res.body,'text','object has text property');
          assert.property(res.body,'created_on','object has created_on property');
          assert.property(res.body,'bumped_on','object has bumped_on property');
          assert.property(res.body,'_id','object has _id property');
          
          //replies array
          assert.property(res.body,'replies','object has replies property');
          assert.isArray(res.body.replies);
          assert.property(res.body.replies[0],'text','replies array object has text property');
          assert.property(res.body.replies[0],'created_on','replies array object has created_on property');
          assert.property(res.body.replies[0],'_id','replies array object has _id property');
          
          exampleReplyId = res.body.replies[0]._id ;
          
          done();
        });
        
      });
    });
    
    suite('PUT', function() {
      test('Test PUT (replies) for testBoard',function(done){
        chai.request(server)
        .put('/api/replies/testBoard')
        .send({
          thread_id: exampleThreadId,
          reply_id: exampleReplyId
        })
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.body.result,'success');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('Test DELETE (replies) for testBoard with wrong password',function(done){
        chai.request(server)
        .delete('/api/replies/testBoard')
        .send({
          thread_id: exampleThreadId,
          reply_id: exampleReplyId,
          delete_password: ''
        })
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.body.result,'incorrect password');
          done();
        });
      });
      
      test('Test DELETE (replies) for testBoard with correct password',function(done){
        chai.request(server)
        .delete('/api/replies/testBoard')
        .send({
          thread_id: exampleThreadId,
          reply_id: exampleReplyId,
          delete_password: 'test'
        })
        .end(function(err,res) {
          assert.equal(res.status,200);
          assert.equal(res.body.result,'success');
          done();
        });
      });
      
    });
    
    
  });

  //saving these for the end since need to use exampleThreadId throughout the tests
  suite('API ROUTING FOR /api/threads/:board (DELETE)', function() {
  
    suite('DELETE', function() {
        test('Test DELETE for testBoard with wrong password',function(done){
          chai.request(server)
          .delete('/api/threads/testBoard')
          .send({
            thread_id: exampleThreadId,
            delete_password: ''
          })
          .end(function(err,res){
            //console.log('2, ' + res.body.result);
            assert.equal(res.status,200);
            assert.equal(res.body.result,'incorrect password');
            done();
          })
        });
      
        test('Test DELETE for testBoard with correct password',function(done){
          chai.request(server)
          .delete('/api/threads/testBoard')
          .send({
            thread_id: exampleThreadId,
            delete_password: 'test'
          })
          .end(function(err,res){
            //console.log('1, ' + res.body.result);
            assert.equal(res.status,200);
            assert.equal(res.body.result,'success');
            done();
          })
        });

      });
    
  });
  
});
