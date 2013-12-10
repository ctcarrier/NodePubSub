'use strict';

var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    chai = require('chai'),
    should = chai.should(),
    request = require('supertest'),
    url = 'http://localhost:8080',
    topicName1 = 'topicName1',
    topicName2 = 'topicName2',
    authHeader = 'Basic dGVzdDp0ZXN0' //base64 encode test:test
    ,
    message1 = {
        message: 'Message1'
    }, message2 = {
        message: 'Message2'
    };

describe("The PubSub service", function () {

    before(function (done) {

        var server = require('../rest_server');

        // make sure the server is started
        setTimeout(function () {
            request(url)
                .get('/')
                .expect(404)
                .end(function (err, res) {
                    if (err) {
                        if (err.code === 'ECONNREFUSED') return done(new Error('Server is not running.'));
                        return done(err);
                    }
                    return done();
                });
        }, 500);
    });

    it('should create a new message in topic1', function (done) {
        request(url)
            .post('/topics/' + topicName1 + '/messages')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .send(message1)
            .expect(201)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                resp.message.should.equal(message1.message);
                return done();
            });
    });

    it('should create another message in topic1', function (done) {
        request(url)
            .post('/topics/' + topicName1 + '/messages')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .send(message2)
            .expect(201)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                resp.message.should.equal(message2.message);
                return done();
            });
    });

    it('should create a new message in topic2', function (done) {
        request(url)
            .post('/topics/' + topicName2 + '/messages')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .send(message1)
            .expect(201)
            .expect('Content-Type', 'application/json')
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                resp.message.should.equal(message1.message);
                return done();
            });
    });

    it('should subscribe to topic1', function (done) {
        request(url)
            .put('/topics/' + topicName1 + '/subscriptions')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(204)
            .end(function (err, res) {
                if (err) return done(err);
                return done();
            });
    });

    it('should get messages from topic1 and not topic2', function (done) {
        request(url)
            .get('/messages')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                chai.assert(Array.isArray(resp[topicName1]));
                resp[topicName1].length.should.equal(2);
                chai.assert(typeof resp[topicName2] === 'undefined');
                return done();
            });
    });

    it('should subscribe to topic2', function (done) {
        request(url)
            .put('/topics/' + topicName2 + '/subscriptions')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(204)
            .end(function (err, res) {
                if (err) return done(err);
                return done();
            });
    });

    it('should get messages from topic1 and topic2', function (done) {
        request(url)
            .get('/messages')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                resp[topicName1].length.should.equal(2);
                resp[topicName2].length.should.equal(1);
                return done();
            });
    });

    it('should unsubscribe to topic1', function (done) {
        request(url)
            .del('/topics/' + topicName1 + '/subscriptions')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(204)
            .end(function (err, res) {
                if (err) return done(err);
                return done();
            });
    });

    it('should only get messages from topic2', function (done) {
        request(url)
            .get('/messages')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                chai.assert(typeof resp[topicName1] === 'undefined', "topicName1 is defined and is: " + resp[topicName1]);
                resp[topicName2].length.should.equal(1);
                return done();
            });
    });

    it('should directly get messages from topic2', function (done) {
        request(url)
            .get('/topics/' + topicName2 + '/messages')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                var resp = res.body;
                chai.assert(typeof resp[topicName1] === 'undefined', "topicName1 is defined and is: " + resp[topicName1]);
                resp[topicName2].length.should.equal(1);
                return done();
            });
    });

    it('should fail to directly get messages from topic1', function (done) {
        request(url)
            .get('/topics/' + topicName1 + '/messages')
            .set('Accept', 'application/json')
            .set('Authorization', authHeader)
            .expect(403)
            .end(function (err, res) {
                if (err) return done(err);
                return done();
            });
    });

});
