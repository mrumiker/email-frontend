## Mail

CS50W Project 3

Email frontend, in pure JavaScript

by Charles Umiker

## Want to try it out?

First, you'll need to [clone the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository).

Next, make sure that you have [Python](https://www.python.org/downloads/) installed.

If you don't have Django installed, run `pip3 install django` in your terminal.

Then, in your terminal, navigate to the cloned directory and enter `python manage.py migrate` (or `python3 manage.py migrate`)
This should initialize a SQLite3 database file for your emails.

Now, enter `python manage.py runserver` (or `python3 manage.py runserver`)
This will open the development server. In your browser, visit the url provided, register, and login to see the site in action!

## Using Django Admin as a SuperUser

If you want to get in through the back door:

First, create a superuser: `python manage.py createsuperuser` (or `python3 manage.py createsuperuser`)
Follow the prompts to create a superuser account.

Now add `/admin` to the end of the URL and login with your superuser credentials. 
This will allow you to create users, add and delete emails, and do many other administrative tasks with the Django Admin interface.