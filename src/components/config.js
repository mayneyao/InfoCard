/*global chrome*/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';




const bookList = [
    {
        userName: 'eastlakeside',
        repoName: 'interpy-zh',
        banchName: 'master',
        chapterPath: ['.', '__DIR__'],
        tags: ['python'],
        type: 'md',
    },
    {
        userName: 'yidao620c',
        repoName: 'python3-cookbook',
        banchName: 'master',
        chapterPath: ['source', '__DIR__'],
        tags: ['python'],
        type: 'rst', // ！rst格式的文档支持不够好
    },
]

const styles = {
    appBar: {
        position: 'relative',
    },
    flex: {
        flex: 1,
    },
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class FullScreenDialog extends React.Component {
    state = {
        open: false,
        config: []
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    updateData = (obj) => {
        this.setState({
            config: obj.jsObject
        })
    }

    save = () => {
        const { config } = this.state
        chrome.storage.local.set({ sourceConfig: config }, function () {
            console.log('Value is set to ', config);
        });
        this.handleClose()
    }

    componentDidMount() {
        chrome.storage.local.get(['sourceConfig'], function (result) {
            console.log('Value currently is ' + result.sourceConfig);
            this.setState({
                config: result.sourceConfig
            })
        });
    }
    render() {
        const { classes } = this.props;
        const { config } = this.state
        return (
            <div>
                <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
                    配置
        </Button>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleClose}
                    TransitionComponent={Transition}
                >
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" color="inherit" className={classes.flex}>
                                信息源配置
              </Typography>
                            <Button color="inherit" onClick={this.save}>
                                保存
              </Button>
                        </Toolbar>
                    </AppBar>
                    <div style={{ width: "100%", height: "100%" }}>
                        <JSONInput
                            placeholder={config} // data to display
                            theme="dark_vscode_tribute"
                            locale={locale}
                            // colors={{
                            //     string: "#DAA520" // overrides theme colors with whatever color value you want
                            // }}
                            height="100%"
                            width="100%"
                            onChange={this.updateData}
                        />
                    </div>
                </Dialog>
            </div>
        );
    }
}

FullScreenDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FullScreenDialog);
