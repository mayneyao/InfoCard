import React, { Component } from 'react';
import GitHub from 'github-api';
import Markdown from 'react-markdown';
import hljs from 'highlight.js';
import rst2mdown from 'rst2mdown';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import localforage from 'localforage';

import Config from './components/config';
import Tag from './components/hashColorTag';

import 'highlight.js/styles/github.css';
import './App.css';

import Loading from './index.svg'

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});


function randomOne(list) {
  let randomIndex = getRandomInt(list.length - 1)
  return list[randomIndex]
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class App extends Component {

  constructor() {
    super()
    this.state = {
      'book': {},
      'text': '',
      'type': 'md',
      'url': '',
      'loading': true
    }
  }

  getRandomSection = (bookRepo, listOfSection, type) => {
    if (!listOfSection) {
      window.location.reload()
    }
    let randomP = randomOne(listOfSection.filter(item => item.name.endsWith(`.${type}`)))
    bookRepo.getBlob(randomP.sha).then(res => {
      this.setState({
        'url': randomP.html_url,
        'text': res.data,
        'type': type,
        'loading': false
      }, () => {
        let els = document.querySelectorAll('pre code');
        for (let i = 0; i < els.length; i++) {
          if (!els[i].classList.contains('hljs')) {
            hljs.highlightBlock(els[i]);
          }
        }
      })
    })
  }


  // 初始化图书源
  async initBookData() {
    const gh = new GitHub()
    const sourceRepo = gh.getRepo('mayneyao', 'InfoCard')
    const res = await sourceRepo.getSha('dev-web', 'src/source.json')
    const content = await sourceRepo.getBlob(res.data.sha)
    const bookData = await localforage.setItem('books', content.data)
    return bookData
  }


  bookDict2List = (bookData) => {
    return Object.entries(bookData).map(item => {
      let [key, book] = item
      let [userName, repoName, branchName] = key.split('/')
      if (book.checked) {
        return {
          userName,
          repoName,
          branchName,
          ...book
        }
      }
    }).filter(item => Boolean(item))
  }

  async componentDidMount() {
    const gh = new GitHub()
    let that = this

    let books = []
    let bookData = await localforage.getItem('books') || await this.initBookData()
    bookData = await localforage.getItem('books')
    books = this.bookDict2List(bookData)
    // 一本书都没勾选时的处理
    if (!books.length) {
      // 初始化数据，保证始终有一本书可选
      bookData = await this.initBookData()
    }
    books = this.bookDict2List(bookData)
    let bookInfo = randomOne(books)
    const { userName, repoName, branchName, chapterPath, type } = bookInfo
    const bookRepo = gh.getRepo(userName, repoName)

    that.setState({
      book: bookInfo
    }, () => {
      // 获取书籍任一章节
      bookRepo.getSha(branchName, chapterPath[0]).then(res => {
        if (chapterPath.length === 2) {
          // 
          let allCha = res.data.filter(item => item.size === 0)
          let randomCha = randomOne(allCha)
          bookRepo.getSha(branchName, randomCha.path).then(res => {
            that.getRandomSection(bookRepo, res.data, type)
          })
        } else {
          that.getRandomSection(bookRepo, res.data, type)
        }
      })
    })
  }

  render() {
    const { classes } = this.props
    const { text, type, url, book, loading } = this.state

    let parseFunc = {
      rst: (t) => rst2mdown(t),
      md: (t) => t
    }
    let mdSource = parseFunc[type](text)

    return (
      <div className="App">
        {
          loading ? <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <img src={Loading} style={{ margin: '0 auto' }} />
          </div> : <div>

              <div style={{ display: 'flex', marginTop: '2em' }}>
                <Tag tag={book.name} />
                {
                  book.tags && book.tags.map(item => <Tag tag={item} key={item} />)
                }
                <div style={{
                  background: '#fff',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  height: '24px',
                  borderRadius: '3px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  fontSize: '14px',
                  lineHeight: '120%',
                  fontWeight: '400',
                  margin: '0px 6px 6px 0px',
                }}><a href={url} target="_blank"> 在github中查看 </a></div>
              </div>

              <Paper className={classes.root} elevation={1}>
                <Typography component="div">
                  <Markdown source={mdSource} escapeHtml={false} />
                </Typography>
              </Paper>
              <Config />
            </div>
        }
      </div>
    );
  }
}

export default withStyles(styles)(App);