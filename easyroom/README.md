About PySlinky
========

PySlinky is a simple web application to test and learn about autoscaling and scalability in general.    
It was named after a very popular [toy](http://en.wikipedia.org/wiki/Slinky) which was basically a helical spring. It uses [Flask](http://flask.pocoo.org) and it's meant to test and learn how scalability on different approaches will work.
The idea here is to stress the app enough to trigger autoscaling watches either by using the database or simply the server load. 
A reverse proxy will be used to access this application.

Requirements
======

*  [psutil](https://github.com/giampaolo/psutil)
* [Flask](http://flask.pocoo.org)
* [netifaces]

Services and Contents
=======   
Health requests
   
     GET /health/ 
        returns the health since last checked
     GET /health/1
        returns current health 

Load requests
  
     GET /load/
        stresses the application using the default expression to evaluate (x**x)
     GET /load/expression
        stresses the application using the provided expression

Acknowledgement
=========

I would like to thank my friend bozo (vitor) helping me pick the name of this project :3.
