import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
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
            books: {}
        };
    }

    handleToggle = (key) => {
        const { books } = this.state;
        localforage.getItem('books').then(books=>{
            books[key].checked= !books[key].checked
            localforage.setItem('books',books).then(res=>{
                console.log(res)
                this.setState({books:res})
            })
        })
    };


    componentDidMount() {
        // 获取已经配置好的开源图书信息
        localforage.getItem('books').then(books=>{
            if (books){
                this.setState({books})
            }else{
                const gh = new GitHub()
                const sourceRepo = gh.getRepo('mayneyao', 'InfoCard')
                sourceRepo.getSha('dev', 'src/source.json').then(res => {
                    sourceRepo.getBlob(res.data.sha).then(res => {
                        localforage.setItem('books',res.data)
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
        const { books } = this.state;


        return (
            <List dense className={classes.root}>
                {Object.entries(books).map(item=>{
                    let [key,book] = item

                    let [userName,repoName,branchName] = key.split('/')
                    return (
                        <ListItem key={key} button>
                        {/* <ListItemAvatar>
                            <Avatar
                                alt={`Avatar n°${book + 1}`}
                                src={`/static/images/avatar/${book + 1}.jpg`}
                            />
                        </ListItemAvatar> */}
                        <ListItemText primary={book.name} />
                        <ListItemSecondaryAction>
                            <Checkbox
                                onChange={()=>this.handleToggle(key)}
                                checked={book.checked}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    )
                })}
            </List>
        );
    }
}

CheckboxListSecondary.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CheckboxListSecondary);
