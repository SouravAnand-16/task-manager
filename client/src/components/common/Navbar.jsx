import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout, setUser } from '../../redux/userSlice';

const Navbar = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEditOpen = () => {
    setEditOpen(true);
    setAnchorEl(null);
  };

  const handleEditSave = () => {
    const updatedUser = { ...user, username: editedUsername };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch(setUser({ user: updatedUser, token: localStorage.getItem('token') }));
    setEditOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "##9575cd" }}>
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: { xs: 1, sm: 0 },
            px: 2,
            py: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "#fff", mb: { xs: 1, sm: 0 } }}
          >
            Task Manager
          </Typography>

          {!user ? (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Typography>Welcome, {user.username?.toUpperCase()}</Typography>
              {user.role === "admin" ? (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Panel
                </Button>
              ) : (
                <Button color="inherit" component={Link} to="/user">
                  User Panel
                </Button>
              )}
              <Avatar
                onClick={handleMenuOpen}
                sx={{ bgcolor: "secondary.main", cursor: "pointer" }}
              >
                {user.username[0]?.toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEditOpen}>Edit Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* Edit Username Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={editedUsername}
            onChange={(e) => setEditedUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
