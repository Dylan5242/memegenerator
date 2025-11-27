import React, { useState, useEffect } from 'react'
import memesData from '../../data/memesData.json'
import './MemeGenerator.css'

// ---- VITE: загрузка всех изображений из папки ----
const modules = import.meta.glob('../../assets/images/*.{jpg,jpeg,png,webp,gif}', {
    eager: true,
    as: 'url'
})

// Создаём нормализованную карту (name → URL)
const imageMap = {}

Object.entries(modules).forEach(([path, url]) => {
    const filename = path.split('/').pop()           // meme1.jpg
    const lower = filename.toLowerCase()             // meme1.jpg
    const noExt = lower.replace(/\.[^/.]+$/, '')     // meme1

    imageMap[lower] = url
    imageMap[noExt] = url
})

console.log('Загруженные изображения:', Object.keys(imageMap))

const MemeGenerator = () => {
    const [currentImage, setCurrentImage] = useState(null)
    const [currentCaption, setCurrentCaption] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [debugInfo, setDebugInfo] = useState('')

    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)]

    const generateMeme = () => {
        setIsLoading(true)
        setError('')

        setTimeout(() => {
            try {
                const randomImageName = getRandomItem(memesData.images)
                const randomCaption = getRandomItem(memesData.captions)

                const normalized = randomImageName.toLowerCase()
                const noExt = normalized.replace(/\.[^/.]+$/, '')

                const selected =
                    imageMap[normalized] ||
                    imageMap[noExt]

                setDebugInfo(
                    `Запрошено: ${randomImageName}\nНайдено: ${!!selected}`
                )

                if (!selected) {
                    throw new Error(
                        `Не удалось найти картинку "${randomImageName}".
Доступные ключи: ${Object.keys(imageMap).join(', ')}`
                    )
                }

                setCurrentImage(selected)
                setCurrentCaption(randomCaption)
            } catch (err) {
                setError(err.message)
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }, 150)
    }

    useEffect(() => {
        generateMeme()
    }, [])

    return (
        <div className="meme-generator">
            {debugInfo && (
                <div className="debug-info">
                    <pre>{debugInfo}</pre>
                </div>
            )}

            <header className="generator-header">
                <h1>Генератор мемов</h1>
            </header>

            <div className="meme-container">
                <div className="meme-frame">
                    {error ? (
                        <div className="error-message">
                            <div>Ошибка</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                {error.split('\n').map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        </div>
                    ) : currentImage ? (
                        <div className="meme-content">
                            <img
                                src={currentImage}
                                alt="Мем"
                                className="meme-image"
                                onError={(e) => {
                                    e.target.style.backgroundColor = '#2c3e50'
                                    e.target.alt = 'Не удалось загрузить изображение'
                                }}
                            />
                            <div className="caption-container">
                                <p className="meme-caption">{currentCaption}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="meme-placeholder">
                            {isLoading ? '🔄 Загрузка...' : 'Нажмите "Сгенерировать"'}
                        </div>
                    )}
                </div>
            </div>

            <div className="controls">
                <button
                    className={`generate-btn ${isLoading ? 'loading' : ''}`}
                    onClick={generateMeme}
                    disabled={isLoading}
                >
                    {isLoading ? '🔄 Генерируем...' : '🎲 Сгенерировать'}
                </button>

                <div className="meme-info">
                    <span>Картинок: <strong>{memesData.images.length}</strong></span>
                    <span>Подписей: <strong>{memesData.captions.length}</strong></span>
                </div>
            </div>

            {error && (
                <div className="error-help">
                    <p><strong>Проверьте:</strong></p>
                    <p>1. Файлы в src/assets/images</p>
                    <p>2. Имена совпадают с JSON</p>
                    <p>3. Расширения: .jpg .png .webp</p>
                </div>
            )}
        </div>
    )
}

export default MemeGenerator
