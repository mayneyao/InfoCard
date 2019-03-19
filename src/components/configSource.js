import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

import Checkbox from '@material-ui/core/Checkbox';
import GitHub from 'github-api';
import localforage from 'localforage';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import Snackbar from '@material-ui/core/Snackbar';


const styles = theme => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    btn: {
        textAlign: 'center',
        margin: 5
    }
});

class CheckboxListSecondary extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            books: {},
            personalBooks: {},
            loading: false,
            open: false
        };
    }


    pullBookSourceFromGithub = () => {
        // 获取源数据
        this.setState({
            loading: true
        }, () => {
            const gh = new GitHub()
            const sourceRepo = gh.getRepo('mayneyao', 'InfoCard')
            sourceRepo.getSha('dev-web', 'src/source.json').then(res => {
                sourceRepo.getBlob(res.data.sha).then(res => {

                    let newBookData = res.data
                    localforage.getItem('books').then(oldBookData => {
                        if (oldBookData) {
                            // 与现有数据merge
                            Object.entries(oldBookData).map(item => {
                                let [key, book] = item
                                if (key in newBookData) {
                                    newBookData[key].checked = book.checked
                                }
                            })
                        }
                        localforage.setItem('books', newBookData)
                        this.setState({
                            books: newBookData,
                            loading: false
                        })
                    })
                })
            })
        })
    }

    handleToggle = (item) => {
        let [key, book] = item
        if (book.private) {
            localforage.getItem('personalBooks').then(books => {
                books[key].checked = !books[key].checked
                localforage.setItem('personalBooks', books).then(res => {
                    this.setState({ personalBooks: res })
                })
            })
        } else {
            localforage.getItem('books').then(books => {
                books[key].checked = !books[key].checked
                localforage.setItem('books', books).then(res => {
                    this.setState({ books: res })
                })
            })
        }
    };


    handleChange = (e) => {
        console.log(e)
        if (!e.error) {
            // todo 数据校验
            const personalBooks = e.jsObject
            this.setState({ personalBooks })
        }
    }

    handleUpdatePersonalBooks = () => {
        const { books, personalBooks } = this.state
        localforage.setItem('personalBooks', personalBooks).then(res => {
            this.setState({
                personalBooks: res,
                open: true
            })
        })
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    async componentDidMount() {
        // 获取已经配置好的开源图书信息
        const books = await localforage.getItem('books')
        const personalBooks = await localforage.getItem('personalBooks')
        this.setState({ personalBooks })
        if (books) {
            this.setState({ books })
        } else {
            const gh = new GitHub()
            const sourceRepo = gh.getRepo('mayneyao', 'InfoCard')
            sourceRepo.getSha('dev-web', 'src/source.json').then(res => {
                sourceRepo.getBlob(res.data.sha).then(res => {
                    localforage.setItem('books', res.data)
                    this.setState({
                        books: res.data
                    })
                })
            })
        }

    }

    render() {
        const { classes } = this.props;
        const { books, loading, personalBooks, open } = this.state;


        const allBooks = { ...books, ...personalBooks }
        return (
            <div>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={open}
                    onClose={this.handleClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">个人信息源保存成功</span>}
                />

                {/* <Divider/> */}
                <Grid container spacing={24} style={{ maxWidth: 900, margin: '0 auto' }}>
                    <Grid item xs={6}>
                        <Paper className={classes.paper}>

                            <div>
                                <JSONInput
                                    id='a_unique_id'
                                    placeholder={personalBooks}
                                    // colors={darktheme}
                                    locale={locale}
                                    height='800px'
                                    width='100%'
                                    onChange={this.handleChange}
                                />
                                <Button variant="contained" color="primary" fullWidth onClick={this.handleUpdatePersonalBooks} >保存个人信息源</Button>
                            </div>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.paper}>
                            <List dense className={classes.root} >
                                {Object.entries(allBooks).map(item => {
                                    let [key, book] = item
                                    return (
                                        <ListItem key={key} button>
                                            <ListItemText primary={book.name} />
                                            <ListItemSecondaryAction>
                                                <span>{book.private ? '私人' : '公共'}</span>
                                                <Checkbox
                                                    onChange={() => this.handleToggle(item)}
                                                    checked={book.checked}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                })}
                            </List>
                            <Button variant="contained" color="primary" fullWidth onClick={this.pullBookSourceFromGithub} disabled={loading} >更新公共信息源</Button>
                        </Paper>
                    </Grid>
                </Grid>
            </div >
        );
    }
}

CheckboxListSecondary.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CheckboxListSecondary);
