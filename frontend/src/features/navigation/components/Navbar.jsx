import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import { Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// Import the new ChatbotDialog component
import { ChatbotDialog } from './ChatbotDialog'; // Adjust path if needed

export const Navbar = ({ isProductList = false }) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userInfo = useSelector(selectUserInfo);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const wishlistItems = useSelector(selectWishlistItems);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);

  // State for controlling the chat dialog (now just a boolean)
  const [openChatDialog, setOpenChatDialog] = React.useState(() => {
    return localStorage.getItem('chatbot_open') === 'true';
  });

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Fixed menu item click handler
  const handleMenuItemClick = (event, to) => {
    event.preventDefault();
    event.stopPropagation();

    // Close menu immediately
    setAnchorElUser(null);

    // Use setTimeout to ensure menu closes before navigation
    setTimeout(() => {
      navigate(to);
    }, 0);
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  // Handlers for opening and closing the chatbot dialog
  const handleOpenChatDialog = () => {
    setOpenChatDialog(true);
    localStorage.setItem('chatbot_open', 'true');
  };

  const handleCloseChatDialog = () => {
    setOpenChatDialog(false);
    localStorage.setItem('chatbot_open', 'false');
  };


  const settings = [
    { name: "Home", to: "/" },
    { name: 'Profile', to: loggedInUser?.isAdmin ? "/admin/profile" : "/profile" },
    { name: loggedInUser?.isAdmin ? 'Orders' : 'My orders', to: loggedInUser?.isAdmin ? "/admin/orders" : "/orders" },
    { name: 'Logout', to: "/logout" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "none",
        color: theme.palette.text.primary
      }}
    >
      <Toolbar sx={{ p: 1, height: "4rem", display: "flex", justifyContent: "space-around" }}>

        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          MERN SHOP
        </Typography>

        <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={userInfo?.name} src="null" />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            // Add these props to improve menu behavior
            disableAutoFocusItem
            disableRestoreFocus
          >

            {
              loggedInUser?.isAdmin &&

              <MenuItem
                onClick={(event) => handleMenuItemClick(event, "/admin/add-product")}
                sx={{ minHeight: 48 }}
              >
                <Typography
                  color={'text.primary'}
                  sx={{ textDecoration: "none" }}
                  textAlign="center"
                >
                  Add new Product
                </Typography>
              </MenuItem>

            }
            {settings.map((setting) => (
              <MenuItem
                key={setting.name}
                onClick={(event) => handleMenuItemClick(event, setting.to)}
                sx={{ minHeight: 48 }}
              >
                <Typography
                  color={'text.primary'}
                  sx={{ textDecoration: "none" }}
                  textAlign="center"
                >
                  {setting.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
          <Typography variant='h6' fontWeight={300}>{is480 ? `${userInfo?.name.toString().split(" ")[0]}` : `Hey👋, ${userInfo?.name}`}</Typography>
          {loggedInUser.isAdmin && <Button variant='contained'>Admin</Button>}
          <Stack sx={{ flexDirection: "row", columnGap: "1rem", alignItems: "center", justifyContent: "center" }}>


            {
              cartItems?.length > 0 &&
              <Badge badgeContent={cartItems.length} color='error'>
                <IconButton onClick={() => navigate("/cart")}>
                  <ShoppingCartOutlinedIcon />
                </IconButton>
              </Badge>
            }

            {
              !loggedInUser?.isAdmin &&
              <Stack>
                <Badge badgeContent={wishlistItems?.length} color='error'>
                  <IconButton component={Link} to={"/wishlist"}><FavoriteBorderIcon /></IconButton>
                </Badge>
              </Stack>
            }
            {
              isProductList && <IconButton onClick={handleToggleFilters}><TuneIcon sx={{ color: isProductFilterOpen ? "black" : "" }} /></IconButton>
            }

            {/* ChatBot Button - hide on mobile and for admin */}
            {!loggedInUser?.isAdmin && !isMobile && (
              <IconButton onClick={handleOpenChatDialog}>
                <ChatBubbleOutlineIcon />
              </IconButton>
            )}

          </Stack>
        </Stack>
      </Toolbar>

      {/* Render the ChatbotDialog component */}
      {!loggedInUser?.isAdmin && !isMobile && (
        <ChatbotDialog
          open={openChatDialog}
          onClose={handleCloseChatDialog}
        />
      )}
    </AppBar>
  );
};