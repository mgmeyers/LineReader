# LineReader

Reads files line by line using the HTML5 File API.

## Usage

After the user has selected a file: 

```javascript
// Grab a file reference
var file = document.getElementById('my-file-input').files[0];

// Create a new instance of the LineReader
var lr = new LineReader();

// Bind to the line event
lr.on('line', function (line, next) {
  // Do something with line....

  next(); // Call next to resume...
});

// Begin reading the file
lr.read(file);
```


### `LineReader( [options] )`

The LineReader constructor. You can pass in options here.

#### Available Options
`chunkSize`: How much data to read at a time. Defaults to `1024`

#### Example

```javascript
var myLineReader = new LineReader({
  chunkSize: 500
});
```


### `LineReader.on( eventName, callback )`

Binds events.

`line` `(line, next)`: Triggered every time a line is read. A `line` string and a `next` function are passed in as arguments. To read the next line, `next` must be called.

`error` `(errorObj)`: Triggered when an error occurs while reading a file. A [DOMError](https://developer.mozilla.org/en-US/docs/Web/API/DOMError) is passed to the callback.

`end`: Triggered when the file has been read completely, or when the `LineReader#abort` method has been called.


### `LineReader.read( file )`

Starts the read process on the passed in `file` reference.


### `LineReader.abort()`

Aborts the read process and prevents lines from being emitted.

