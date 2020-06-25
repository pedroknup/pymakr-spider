# Pymakr Spider

This application was built to track the downloads counter of the Pymakr extension. 

It's a web crawler/spider bot that opens a virtual browser in memory and navigate to Pymakr's sites on the Microsoft and Atom marketplaces, since they don't provide an open API. Those numbers are stored by default in the history.txt file and it compares the today's numbers with the latest saved day.

If the last rows of history.txt are 

* 03/06/2020;95916;33970;
* 03/06/2020;95931;33978;
* 22/06/2020;97324;35041;
* 22/06/2020;97332;35098;

and today's (25/06/2020) record is

* 25/06/2020;97567;35276;

the output would be 

![Output](https://i.imgur.com/1XD07D4.png)

Note that only the latest record of the latest date was considered.

### To Do
- [ ] Create a Cron Job to run this app on a daily basis. 
- [ ] Store the data on AWS
- [ ] Chart representation? 



