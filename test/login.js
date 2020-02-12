var app = require('../server'),
request = require('supertest');
assert = require('assert'),
chai = require('chai'),
should = require('should');
describe('POST /login', function() {
  it('logs user in', function(done) {
    request(app)
    .post('/v1/api/login')
    .send({email: 'your@email.com', password: 'yourpassword'})
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200).end(function(err,res){
      res.status.should.equal(200);
      res.body.success.should.equal(true);
      done();
    });
  });
});