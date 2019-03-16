import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import Checkbox from '@material-ui/core/Checkbox';
import GitHub from 'github-api';
import localforage from 'localforage';

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
});

class CheckboxListSecondary extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            books: {},
            loading: false
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

    handleToggle = (key) => {
        localforage.getItem('books').then(books => {
            books[key].checked = !books[key].checked
            localforage.setItem('books', books).then(res => {
                this.setState({ books: res })
            })
        })
    };


    componentDidMount() {
        // 获取已经配置好的开源图书信息
        localforage.getItem('books').then(books => {
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
        })
    }

    render() {
        const { classes } = this.props;
        const { books, loading } = this.state;


        return (
            <div style={{
                margin: '0 auto',
                width: '360px'
            }}>

                <List dense className={classes.root}>
                    {Object.entries(books).map(item => {
                        let [key, book] = item
                        // let [userName, repoName, branchName] = key.split('/')
                        return (
                            <ListItem key={key} button>
                                <ListItemText primary={book.name} />
                                <ListItemSecondaryAction>
                                    <Checkbox
                                        onChange={() => this.handleToggle(key)}
                                        checked={book.checked}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        )
                    })}
                </List>
                <Button variant="contained" color="primary" fullWidth onClick={this.pullBookSourceFromGithub} disabled={loading}>更新图书源</Button>
            </div>
        );
    }
}

CheckboxListSecondary.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CheckboxListSecondary);
