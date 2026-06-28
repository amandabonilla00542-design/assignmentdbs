exports.getProfile = (req, res) => {
    res.json({ 
        success: true, 
        message: 'Profile fetched successfully',
        user: res.locals.user
    });
}