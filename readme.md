Critical CSS API
======================
This nodeJS app provides a simple API to generate the Critical CSS from a given URL. Its based on `Hello Advanced CCSS API` by [Dimitri Suter](https://github.com/gnochi) for [Say Hello GmbH](https://github.com/SayHelloGmbH/).

https://api.criticalcss.io

## Routes

### generate Critical CSS
https://api.critical-css.io/

`POST`-Request with the following JSON-body data:

```
{
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
