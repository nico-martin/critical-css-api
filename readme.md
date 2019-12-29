Critical CSS API
======================
This nodeJS app provides a simple API to generate the Critical CSS from a given URL.  
https://api.criticalcss.io

**Version 2** introduces a whole user management based on MongoDB where users can create and delete projects.

## Env
The following env variables are required to use the app:
* **DATABASE_URL**: the host of the MongoDB
* **MASTER_KEY**: a private Key to identify as Master user
* **JWT_SECRET**: a private Key to generate and verify JSON Web Tokens

## Authentification
All requests except the `generate Critical CSS` require a Bearer Token for authentification.
This can be a JWT to authenticate as a user (restricted access to elements "owned" by the user) or the MASTER_KEY from the env vars to identify as "master" and have full access.

## Routes

### generate Critical CSS
```POST: https://your-project-host.com:9092/```
```
{
    "token": ":projectToken"
    "url" : "https://sayhello.ch",
    "dimensions": {
        "desktop": { 
            "width":1200,
            "height": 800 
        }, 
        "tablet" : {
            "width":700,
            "height": 300
        }
    } 
}
```

### Get all users
```GET: https://your-project-host.com:9092/user/```

### Get single user
```GET: https://your-project-host.com:9092/user/:userID/```

### Create user
```PUT: https://your-project-host.com:9092/user/```
```
{
    "email": "jd@jdmail.com",
    "firstname": "John",
    "lastname": "Doe",
    "password": "xyz"
}
```

### Update user
```PUT: https://your-project-host.com:9092/user/:userID/```
```
{
    "lastname": "Muster",
    "password": "hello"
}
```

### Delete user
```DELETE: https://your-project-host.com:9092/user/:userID/```

### User SignIn
```POST: https://your-project-host.com:9092/user/signin/```
```
{
    "email": "jd@jdmail.com",
    "password": "hello"
}
```

### Update user credits
```PUT: https://your-project-host.com:9092/credits/```
```
{
    "userID": 2,
    "credits": "100"
}
```

### User JWT validate
```GET: https://your-project-host.com:9092/user/jwt/validate/```

### Add Project
```PUT: https://your-project-host.com:9092/project/```
```
{
    "url": "https://sayhello.ch",
    "userID": 2
}
```

### Delete Project
```DELETE: https://your-project-host.com:9092/project/:projectID/```

