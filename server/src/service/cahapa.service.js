const axios = require('axios')
const axiosRetry = require('axios-retry').default
const { buildChapaPayload, getChapaHeaders, logger } = require('../utils/chapa')

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay })

const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1'

async function request(method, url, data) {
  try {
    const response = await axios({
      method,
      url: `${CHAPA_BASE_URL}${url}`,
      data,
      headers: getChapaHeaders(),
      timeout: 15000,
    })
    return response.data
  } catch (err) {
    logger.error({
      layer: 'chapa_service',
      message: err.message,
      response: err.response?.data,
    })
    throw new Error('Chapa service unavailable')
  }
}

exports.initiatePayment = (data) =>
  request('post', '/transaction/initialize', buildChapaPayload(data))

exports.verifyPayment = (tx_ref) =>
  request('get', `/transaction/verify/${tx_ref}`)
