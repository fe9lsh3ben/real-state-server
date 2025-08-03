const signup = (prisma) => async (req, res) => {
  try {
    // Hash password
    const hashedPass = await argon2.hash(req.body.Password);
    req.body.Password = hashedPass;

    const body = req.body;

    // Create user
    const user = await prisma.user.create({
      data: {
        TermsCondetion: { connect: { TC_ID: body.TC_ID } },
        Username: body.Username,
        Email: body.Email,
        Password: body.Password,
        Gov_ID: body.Gov_ID,
        Address: body.Address,
        Full_Name: body.Full_Name,
        User_Phone: body.User_Phone,
      },
    });

    // Generate tokens
    const accessToken = await generateTokenByPrivate_key(user, "4h");
    const refreshToken = await generateTokenByPrivate_key(user, "14d", TokenType.REFRESH_TOKEN);

    // Decode tokens for expiry
    let decoded = jwt.decode(refreshToken);
    const refreshExpiry = new Date(decoded.exp * 1000);

    // Store refresh token
    const storedRefresh = await prisma.refreshToken.create({
      data: {
        Refresh_Token: refreshToken,
        User: { connect: { User_ID: user.User_ID } },
        Expires_At: refreshExpiry,
      },
    });

    decoded = jwt.decode(accessToken);
    const accessExpiry = new Date(decoded.exp * 1000);

    // Store session with access token
    const storedSession = await prisma.Session.create({
      data: {
        User: { connect: { User_ID: user.User_ID } },
        Token: accessToken,
        Expires_At: accessExpiry,
      },
    });

    // Send response
    res.status(201).send({
      data: user,
      Session: {
        Token: storedSession.Token,
      },
      Refresh_Tokens: {
        Refresh_Token: storedRefresh.Refresh_Token,
      },
    });
  } catch (error) {
    dbErrorHandler(res, error, "signup");
  }
};


const login = (prisma) => async (req, res) => {
  try {
    const { Username, Password } = req.body;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { Username },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const validPassword = await argon2.verify(user.Password, Password);
    if (!validPassword) {
      return res.status(403).json({ message: 'Invalid password' });
    }

    // Generate tokens
    const accessToken = await generateTokenByPrivate_key(user, '4h');
    const refreshToken = await generateTokenByPrivate_key(user, '14d', TokenType.REFRESH_TOKEN);

    // Decode tokens for expiry dates
    let decoded = jwt.decode(accessToken);
    const accessExpiry = new Date(decoded.exp * 1000);

    decoded = jwt.decode(refreshToken);
    const refreshExpiry = new Date(decoded.exp * 1000);

    // Update session
    await prisma.user.update({
      where: { User_ID: user.User_ID },
      data: {
        Session: {
          update: {
            Token: accessToken,
            Expires_At: accessExpiry,
          },
        },
        Refresh_Tokens: {
          update: {
            Refresh_Token: refreshToken,
            Expires_At: refreshExpiry,
          },
        },
      },
    });

    // Send tokens back
    return res.status(200).send({
      Session: { Token: accessToken },
      Refresh_Tokens: { Refresh_Token: refreshToken },
    });
  } catch (error) {
    dbErrorHandler(res, error, 'login');
  }
};




const becomeOfficeStaff = (prisma, User_Type) => async (req, res) => {
  try {
    if (req.body.Role === User_Type.REAL_ESTATE_OFFICE_STAFF) {
      return res.status(400).send('You are already an office staff!');
    }

    const user = await prisma.user.findUnique({
      where: { User_ID: req.body.User_ID },
      select: { Role: true },
    });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (user.Role === User_Type.REAL_ESTATE_OFFICE_STAFF) {
      return res.status(400).send('You are already an office staff!');
    }

    await prisma.user.update({
      where: { User_ID: req.body.User_ID },
      data: { Role: User_Type.REAL_ESTATE_OFFICE_STAFF },
    });

    // Call your token refresh function - double-check function name and usage!
    await generateTokenByRefreshToken(prisma)(req, res);

  } catch (error) {
    dbErrorHandler(res, error, 'become office staff');
  }
};



const get_Profile = (prisma) => async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { User_ID: req.body.User_ID },
      select: {
        User_ID: true,
        Role: true,
        Email: true,
        Profile_Image: true,
        Gov_ID: true,
        Address: true,
        Full_Name: true,
        User_Phone: true,
        Other1: true,
        Employer_REO_ID: true,
        Username: true,
        Balance: true,
      },
    });

    if (!profile) {
      return res.status(404).send('Profile not found.');
    }

    return res.status(200).send(profile);
  } catch (error) {
    dbErrorHandler(res, error, 'get profile');
  }
};




const edit_Profile = (prisma) => async (req, res) => {
  try {
    if (!(req.body.Email || req.body.Profile_Image || req.body.Address || req.body.Other1)) {
      return res.status(400).send('Nothing to change?!...');
    }

    const updateData = {};
    if (req.body.Email) updateData.Email = req.body.Email;
    if (req.body.Profile_Image) updateData.Profile_Image = req.body.Profile_Image;
    if (req.body.Address) updateData.Address = req.body.Address;
    if (req.body.Other1) updateData.Other1 = req.body.Other1;

    const updatedProfile = await prisma.user.update({
      where: { User_ID: req.body.User_ID },
      data: updateData,
      select: {
        User_ID: true,
        Role: true,
        Email: true,
        Profile_Image: true,
        Gov_ID: true,
        Address: true,
        Full_Name: true,
        User_Phone: true,
        Other1: true,
        Employer_REO_ID: true,
        Username: true,
        Balance: true,
      },
    });

    return res.status(202).json({
      message: 'Data was updated',
      data: updatedProfile,
    });
  } catch (error) {
    dbErrorHandler(res, error, 'edit profile');
  }
};

module.exports = {
    signup,
    login,
    becomeOfficeStaff,
    get_Profile,
    edit_Profile
}