import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  Box,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, setUser } from '../../redux/userSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? '#ffeb3b' : '#ffffff',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    borderBottom: location.pathname === path ? '2px solid #ffeb3b' : 'none',
    borderRadius: 0,
    textTransform: 'capitalize',
  });

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(to right, #7b1fa2, #512da8)',
          boxShadow: 3,
        }}
      >
        <Toolbar
          sx={{
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.4rem',
              letterSpacing: '1px',
            }}
          >
            Task Manager
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
          >
            <Button component={Link} to="/" sx={navLinkStyle('/')}>
              Home
            </Button>

            {!user ? (
              <>
                <Button component={Link} to="/login" sx={navLinkStyle('/login')}>
                  Login
                </Button>
                <Button component={Link} to="/register" sx={navLinkStyle('/register')}>
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to={user.role === 'admin' ? '/admin' : '/user'}
                  sx={navLinkStyle(user.role === 'admin' ? '/admin' : '/user')}
                >
                  {user.role === 'admin' ? 'Admin Panel' : 'User Panel'}
                </Button>
                <Box>
                  <Avatar
                    onClick={handleMenuOpen}
                    sx={{
                      bgcolor: '#ffb300',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {user.username[0]?.toUpperCase()}
                  </Avatar>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEditOpen}>Edit Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </Box>
              </>
            )}
          </Stack>
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
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
