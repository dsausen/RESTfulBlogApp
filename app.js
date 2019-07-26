//npm i express mongoose ejs body-parser method-override
var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    app = express()

/* App config */
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.use(expressSanitizer())
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost:27017/restful_blog_app")

/* Mongoose/Model config */
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})
var Blog = mongoose.model("Blog", blogSchema)

/* RESTful routes */
app.get("/", (req, res) => {
    res.redirect("/blogs")
})

//REST: INDEX
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) {console.log(`Oh no...\n${err}`)} else {res.render("index.ejs", {blogs: blogs})}
    })
})

//REST: NEW
app.get("/blogs/new", (req, res) => {
    res.render("new.ejs")
})

//REST: CREATE
app.post("/blogs/", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {res.render("new.ejs")} else {res.redirect("/blogs")}
    })
})

//REST: SHOW
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {res.redirect("/blogs")} else {res.render("show.ejs", {blog: foundBlog})}
    })
})

//REST: EDIT
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {res.redirect("/blogs")} else {res.render("edit.ejs", {blog: foundBlog})}
    })
})

//REST: UPDATE
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err) {res.redirect("/blogs")} else {res.redirect(`/blogs/${req.params.id}`)}
    })
})

//REST: DESTROY
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err) {res.redirect("/blogs")} else {res.redirect("/blogs")}
    })
})

app.listen(3000, () => {
    console.log("Serving RESTful Blog App on port 3000.")
})
