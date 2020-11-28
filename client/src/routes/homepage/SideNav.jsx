import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Drawer, CssBaseline, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemIcon, ListItemText, Button  } from '@material-ui/core';
import { Menu, AccountCircle, ChevronLeft, ChevronRight, Home }  from '@material-ui/icons';
import NewRoomButton from "./NewRoomButton";
import './conversation-styles/index.scss';
import './conversation-styles/sideNav.scss';
import { BackgroundColor } from 'chalk';

const drawerWidth = '20vw';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    position: 'fixed',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#383838'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function SideNav(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(true)

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo(0,100);
  }

  useEffect(() => {
    if (open) {
      document.getElementsByClassName('convo-list')[0].style.paddingLeft = '24vw';
      document.getElementsByClassName('convo-list')[0].style.paddingRight = '4vw';
      document.getElementsByClassName('fixed')[0].style.marginLeft = '23vw';
      document.getElementsByClassName('fixed')[0].style.top = '0';
      document.getElementsByClassName('top-btn')[0].className = ('top-btn new-room-button');
    } else {
      document.getElementsByClassName('convo-list')[0].style.paddingLeft = '12vw';
      document.getElementsByClassName('convo-list')[0].style.paddingRight = '12vw';
      document.getElementsByClassName('fixed')[0].style.marginLeft = '13vw';
      document.getElementsByClassName('fixed')[0].style.top = '10vh';
      document.getElementsByClassName('top-btn')[0].className = ('top-btn new-room-button-fixed');
    }
  }, [open]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          className={clsx(classes.menuButton, open && classes.hide)}
        >
          <Menu />
        </IconButton>
        <Typography style={{fontFamily: "'Raleway', sans-serif"}}variant="h6" noWrap>
          Symposium
        </Typography>
      </Toolbar>
      <Drawer 
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      > 
        <div className={classes.drawerHeader} style={{backgroundColor: '#383838'}}>
          <h5 className='nav-title'>Symposium</h5>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
        <Divider />
        <List className='nav-list'>
          <ListItem button onClick={scrollToTop}>
            <ListItemIcon style={{justifyContent: 'center'}}> <Home /> </ListItemIcon>
            <ListItemText primary='Home' style={{paddingLeft: '1em'}}/>
          </ListItem>
          <ListItem button>
            <ListItemIcon style={{justifyContent: 'center'}}> <AccountCircle /> </ListItemIcon>
            <ListItemText primary='JMcCay' style={{paddingLeft: '1em'}}/>
          </ListItem>
          <div className='nav-new-room-btn'>
            <NewRoomButton
              history={props.history}
              connection={props.connection}
              class='nav-btn'
            />
          </div>
        </List>
        <img className='logo' src='icon_c.png' alt='logo'/>
        <Divider />
        <div className='logout'>
          <Button variant="contained" color="primary" style={{width: '18vw'}}>
              Log Out
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
