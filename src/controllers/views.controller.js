const productDaoMongo = require('../daos/mongo/productDaoMongo')
const userDaoMongo = require('../daos/mongo/userDaoMongo')
const { productService, userService, cartService } = require('../repositories/service')
const { logger } = require('../utils/logger')



class ViewsController {
    constructor(){
        this.productViewService = productService
        this.userViewService = userService
        this.cartViewService = cartService
    }

    home = async (req, res) => {
        try{
            const { limit, pageNumber, sort, query } = req.query
            const parsedLimit = limit ? parseInt(limit, 10) : 10
            const userId = req.session && req.session.user ? req.session.user.user : null
            const user = await this.userViewService.getUserBy({ _id: userId })
            const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page } = await this.productViewService.getProducts({ limit: parsedLimit, pageNumber, sort, query })
            //console.log(docs)
            res.render('home', {
                title: 'Home',
                user,
                docs,
                hasPrevPage,
                hasNextPage,
                prevPage,
                nextPage,
                page
            })
        }catch(err){
            logger.error(err)
            res.status(500).send({message:'Server error'})
        }
    }

    realTimeProducts = async (req, res) => {
        try{
            const { limit, pageNumber, sort, query } = req.query
            const parsedLimit = limit ? parseInt(limit, 10) : 10
            const userId = req.session && req.session.user ? req.session.user.user : null
            const user = await this.userViewService.getUserBy({ _id: userId })
            const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page } = await this.productViewService.getProducts({ limit: parsedLimit, pageNumber, sort, query })
            //console.log(docs)
            res.render('realTimeProducts', {
                title: 'Real Time',
                user,
                docs,
                hasPrevPage,
                hasNextPage,
                prevPage,
                nextPage,
                page
            })
        }catch(err){
            logger.error(err)
            res.status(500).send({message:'Server error'})
        }
    }

    chat = async (req,res) => {
        const userId = req.session && req.session.user ? req.session.user.user : null
        const user = await this.userViewService.getUserBy({ _id: userId })
        try{
            res.render('chat', {
            title: "Chat",
            user,
            })
        }catch(err){
            logger.error(err)
            res.status(500).send({message:'Server error'})
        }
    }

    products = async (req,res) =>{
        try{
            const { limit, pageNumber, sort, query } = req.query
            const parsedLimit = limit ? parseInt(limit, 10) : 10
            const userId = req.session && req.session.user ? req.session.user.user : null
            logger.info(userId)
            const user = await this.userViewService.getUserBy({ _id: userId })
            //console.log('User data:', user)
            const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page } = await this.productViewService.getProducts({ limit: parsedLimit, pageNumber, sort, query })
            //console.log(docs)
            res.render('productsView', {
                title: 'Products View',
                user,
                docs,
                hasPrevPage,
                hasNextPage,
                prevPage,
                nextPage,
                page
            })
        }catch(err){
            logger.error(err)
            res.status(500).send({message:'Server error'})
        }
    }

    productsDetails = async (req,res) =>{
        try{
            //agregar para manderle el usuario
            const pid = req.params.pid
            //console.log(pid)
            const filteredProduct = await this.productViewService.getProductById(pid)
            if(filteredProduct){
                res.render('details', {
                    title: 'Detalle del producto',
                    filteredProduct
                })
            }
            else{
                res.status(404).send("El producto no existe")
            }
        }catch(error){
            logger.error(error)
            res.status(500).send('Server error')
        }
    }

    login = async (req,res) =>{
        res.render('login')
    }

    register = async (req,res) =>{
        res.render('register')
    }

    shoppingCart = async(req, res) => {
        try {
            //agregar para mandarle el usuario, para que el boton siempre este bien seteado
            const userId = req.session && req.session.user ? req.session.user.user : null
            if (!userId) {
                return res.status(400).send('no ha iniciado sesion')
            }

            const user = await this.userViewService.getUserBy({ _id: userId })
            const cartId = user.cart
            if (!cartId) {
                return res.status(400).send('Usuario no tiene carrito')
            }

            const cart = await this.cartViewService.getCartById(cartId)
            //console.log('Cart:', cart)

            const productDetailsPromises = cart.map(async item => {
                const productId = item.product.toString()
                const productDetailArray = await this.productViewService.getProductById(productId)
                const productDetail = productDetailArray[0]
                return { productDetail, quantity: item.quantity }
            })
            
            // Esperar a que todas las promesas se resuelvan
            const productsWithQuantities = await Promise.all(productDetailsPromises)
            
            //console.log('Products with quantities:', productsWithQuantities)
            res.render('shoppingCart', { 
                title: 'Carrito de compras',
                cartId,
                productsWithQuantities
            })
        }
        catch(err){
            logger.error(err)
            res.status(500).send('Server error')
        }
    }

}

module.exports = ViewsController