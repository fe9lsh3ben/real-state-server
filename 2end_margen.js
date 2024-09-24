
const PRIVATE_KEY = fs.readFileSync('./private_key.pem', 'utf8'); //generate asymetric keys
const PUBLIC_KEY = fs.readFileSync('./public_key.pem', 'utf8');


// Generate access token
function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
        },
        PRIVATE_KEY,
        {
            algorithm: 'RS256',
            expiresIn: '1h',
        }
    );
}

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    jwt.verify(token, PUBLIC_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // Attach the user to the request object
        next();
    }); 

}

// Route: User login and token generation
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await prisma.user.findUnique({
        where: { username: username },
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Validate the password
    try {
        const validPassword = await argon2.verify(hashedPassword, password);
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid password' });
        }
    } catch (err) {
        throw new Error('Password verification failed');
    }
    

    // Generate JWT using RS256
    const accessToken = generateAccessToken(user);

    res.json({
        accessToken,
        message: 'Login successful',
    });
});

// Route: A protected resource
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({
        message: `Hello ${req.user.username}, welcome to your dashboard!`,
        user: req.user,
    });
});

// Run the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});