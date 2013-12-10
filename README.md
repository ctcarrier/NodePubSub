<h1>NodeJS Pub Sub Web Service Assignment</h1>
<p>This is an extremely simple web service which exposes some HTTP endpoints to do some simple pub sub type tasks</p>
<p>This code is currently up and running on Heroku at http://rocky-citadel-3618.herokuapp.com</p>
<h2>Run the app</h2>
node rest_server.js

<h2>Run the tests</h2>
mocha

<h2>What it can do</h2>
<ul>
<li>Create new topics</li>
<li>Post new messages to topics</li>
<li>Post/Delete subscriptions</li>
<li>Get messages by topic or for all topics based on subscriptions</li>
</ul>

Users are identified using the 'Authorization' HTTP header using basic auth. For example the user 'test' with password 'test' would have an Authorization header like:

Basic dGVzdDp0ZXN0

The credentials are not tested and the username is simply used as is to validate subscriptions.

<h2>Things it doesn't do</h2>
This is a trivially simple implementation that is missing many features that were outside the scope of the exercise. 

All messages are received in bulk and there is no concept of 'old' messages. All messages for a topic are returned every time. This would be a simple feature to add by storing the dateCreated for messages and accepting an 'If-Modified-Since' header.

There is no validation on input objects which is a security consideration.

There is no push system. This would normally be accomplished in HTTP with some kind of long polling solution.

<h2>API</h2>
<b>All requests require basic auth header

<h3>Create Topic</h3>
POST /topics
{
	"name": "<SOME_NAME>"
}

<h3>Create Subscription</h3>
PUT /topics/:name/subscriptions

<h3>Delete Subscriptions</h3>
DELETE /topics/:name/subscriptions

<h3>GET All messages</h3>
GET /messages

<h3>GET messages by topic</h3>
GET /topics/:name/messages

<h3>Create a new message</h3>
POST /topics/:name/messages
{
	"message":"YOUR_MESSAGE_HERE"
}
