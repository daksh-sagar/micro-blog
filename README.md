# Micro Blog

### A blogging application

---

Features

- Registration with Email confirmation (uses mailtrap currently, can be replaced with sendgrid or equivalent service.)
- Logged In user can create posts, the post editor supports Markdown
- Live search for posts
- Profile shows users your are following and users who follow you
- Follow other users
- Home page feed shows posts from your followed users
- A chat room

Technologies used

- Node/express as backend server
- MongoDB as database
- Mongoose as ODM
- EJS templating engine
- SocketIO for chat functionality

To run locally replace values in the **sample.env** with actual values and rename the file to **.env**. Additionally run `npm install` in the root directory.
