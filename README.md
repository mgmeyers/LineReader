# LineReader

Reads files line by line in browser using the HTML5 FileReader API.

## Usage

```javascript
// Get a reference to the file from input[type="file"]
var file = document.getElementById( 'file' ).files[ 0 ];

// Create a new instance of the LineReader
var lr = new LineReader();

// Bind to the line event
lr.on('line', function ( line, next ) {
  // Do something with line....

  next(); // Call next to resume...
});

// Begin reading the file
lr.read( file );
```

## TODO
* Add better documentation
