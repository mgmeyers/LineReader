# LineReader

Reads files line by line in browser using the HTML5 FileReader API.

## Usage

```javascript
// Create a new instance of the LineReader
var lr = new LineReader( file );

// Bind to the line event
lr.on('line', function ( line, next ) {
  // Do something with line....

  next(); // Call next to resume...
});

// Begin reading the file
lr.read();

// Stop the read process
lr.stop();
```
