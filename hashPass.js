const bcrypt = require('bcryptjs');

// The password you want to store
const password = 'mypassword';  // Replace this with the actual password

// Hash the password
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;

  // Log the hashed password, which you can then insert into your database
  console.log('Hashed Password:', hashedPassword);

  // Now, you can manually insert the hashed password into your database.
});