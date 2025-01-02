const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')

const fetchLink = async (url, cookies = null) => {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://www.google.com',
      ...(cookies && { Cookie: cookies.join('; ') })
    },
    maxRedirects: 5
  })
  const $ = cheerio.load(response.data)
  const link = $('a.input.popsok').attr('href')
  return link.startsWith('//') ? `https:${link}` : link
}

const fetchDetails = async (url) => {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0' }
  })
  const $ = cheerio.load(response.data)
  const fileName = $('title').text().split('-')[0].trim() || 'downloaded_file'
  const fileSize = $('a.input.popsok').text().match(/\(([^)]+)\)/)?.[1] || 'Size not found'
  return { fileName, fileSize, fileExt: path.extname(fileName) || '.zip' }
}

const mediafireDl = async (url, cookies = null) => {
  try {
    const initialLink = await fetchLink(url, cookies)
    const fileData = await fetchDetails(initialLink)
    const finalLink = await fetchLink(initialLink, cookies)

    return {
      downloadLink: finalLink,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      fileExt: fileData.fileExt
    }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}

module.exports = { mediafireDl }
