import * as irdbService from './irdb.service.js';

export function getCategories(req, res) {
    try {
        const categories = irdbService.getCategories();
        return res.status(200).json(categories);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export function getBrands(req, res) {
    const { category } = req.params;
    try {
        const brands = irdbService.getBrands(category);
        if (brands === null) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json(brands);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export function getModels(req, res) {
    const { category, brand } = req.params;
    try {
        const models = irdbService.getModels(category, brand);
        if (models === null) {
            return res.status(404).json({ message: 'Category or brand not found' });
        }
        return res.status(200).json(models);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
