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
import Loading from './loading.svg'
import 'highlight.js/styles/github.css';

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
      'loading': true,
      'isFetchDataOk': false
    }
  }

  getRandomSection = (bookRepo, listOfSection, type) => {
    if (!listOfSection) {
      window.location.reload()
    }
    let randomP = randomOne(listOfSection.filter(item => item.name.endsWith(`.${type}`)))
    if (!randomP) {
      this.setState({
        'isFetchDataOk': false,
        'loading': false
      })
    } else {
      bookRepo.getBlob(randomP.sha).then(res => {
        this.setState({
          'isFetchDataOk': true,
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

  async fetchData() {
    const gh = new GitHub()
    let that = this

    let books = []
    let bookData = await localforage.getItem('books') || await this.initBookData()
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
      try {
        bookRepo.getSha(branchName, chapterPath[0]).then(res => {
          if (res.status === 200) {
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
          } else if (res.status === 403) {
            this.setState({
              'fetchDataMsg': '刷新过于频繁请稍后再试',
              'isFetchDataOk': false,
              'loading': false
            })
          }
        })
      } catch{
        this.setState({
          'isFetchDataOk': false,
          'loading': false
        })
      }
    })
  }

  fixGithubImages = () => {
    let images = document.querySelectorAll('#card img')

    const { book: { userName, repoName, branchName } } = this.state

    images.forEach(element => {
      let src = element.getAttribute('src')
      if (src.startsWith("/")) {
        element.setAttribute('src', `https://raw.githubusercontent.com/${userName}/${repoName}/${branchName}${src}`)
      }
    })
  }
  componentDidUpdate() {
    this.fixGithubImages()
  }
  async componentDidMount() {
    await this.fetchData()
    this.fixGithubImages()
  }

  render() {
    const { classes } = this.props
    const { text, type, url, book, loading, isFetchDataOk, fetchDataMsg } = this.state

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
          </div> : isFetchDataOk ?
              <div id="card">
                <div style={{ display: 'flex', marginTop: '2em' }}>
                  <Tag tag={book.name} />
                  {
                    book.tags && book.tags.map(item => <Tag tag={item} key={item} />)
                  }
                  <Tag href={url} tag="在github中查看" />
                </div>

                <Paper className={classes.root} elevation={1} >
                  <Typography component="div">
                    <Markdown source={mdSource} escapeHtml={false} />
                  </Typography>
                </Paper>
                <Config />
              </div>
              : <div> {fetchDataMsg ? fetchDataMsg : `oops~,something wrong!`}<span onClick={this.fetchData}>reload</span></div>
        }
      </div>
    );
  }
}

export default withStyles(styles)(App);