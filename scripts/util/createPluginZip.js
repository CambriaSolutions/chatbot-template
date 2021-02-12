
var fs = require('fs')
var archiver = require('archiver')

var output = fs.createWriteStream('GenBotPlugin.zip')
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
})

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes')
  console.log('archiver has been finalized and the output file descriptor has closed.')
})

output.on('end', function () {
  console.log('Data has been drained')
})

archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err
  }
})

// good practice to catch this error explicitly
archive.on('error', function (err) {
  throw err
})

// pipe archive data to the file
archive.pipe(output)

// append a file from stream
archive.file('../../chatframe/cambria-chatframe.php', { name: 'cambria-chatframe.php' })
archive.file('../../chatframe/index.php', { name: 'index.php' })
archive.file('../../chatframe/uninstall.php', { name: 'uninstall.php' })
archive.file('../../chatframe/white-listed-pages.php', { name: 'white-listed-pages.php' })
archive.directory('../../chatframe/public/partials', 'public/partials')
archive.file('../../chatframe/public/class-cambria-chatframe-public.php', { name: 'public/class-cambria-chatframe-public.php' })
archive.file('../../chatframe/public/index.php', { name: 'public/index.php' })
archive.directory('../../chatframe/public/app/build', 'public/app/build')
archive.directory('../../chatframe/admin', 'admin')
archive.directory('../../chatframe/includes', 'includes')

archive.finalize()