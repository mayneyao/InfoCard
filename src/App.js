/*global chrome*/

import React, { Component } from 'react';
import GitHub from 'github-api';
import Markdown from 'react-markdown';
import hljs from 'highlight.js';
import rst2mdown from 'rst2mdown';

import Config from './components/config';

import 'highlight.js/styles/github.css';
import './App.css';



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
      'url': ''

    }
  }


  getRandomSection = (bookRepo, listOfSection, type) => {
    let randomP = randomOne(listOfSection.filter(item => item.name.endsWith(`.${type}`)))
    bookRepo.getBlob(randomP.sha).then(res => {
      this.setState({
        'url': randomP.html_url,
        'text': res.data,
        'type': type
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
  componentDidMount() {
    const gh = new GitHub()

    let bookInfo = randomOne(bookList)
    const { userName, repoName, banchName, chapterPath, type } = bookInfo
    const bookRepo = gh.getRepo(userName, repoName)

    this.setState({
      book: bookInfo
    }, () => {
      // 获取书籍任一章节
      bookRepo.getSha(banchName, chapterPath[0]).then(res => {
        if (chapterPath.length === 2) {
          // 
          let allCha = res.data.filter(item => item.size === 0)
          let randomCha = randomOne(allCha)
          bookRepo.getSha(banchName, randomCha.path).then(res => {
            this.getRandomSection(bookRepo, res.data, type)
          })
        } else {
          this.getRandomSection(bookRepo, res.data, type)
        }
      })
    })
  }
  render() {
    const { text, type, url, book } = this.state


    let parseFunc = {
      rst: (t) => rst2mdown(t),
      md: (t) => t
    }

    let mdSource = parseFunc[type](text)

    return (
      <div className="App">
        <Markdown source={mdSource} escapeHtml={false} />
        <a href={url}> 在github中查看 </a>
        <Config/>
      </div>
    );
  }
}

export default App;
