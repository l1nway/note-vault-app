import React, {useMemo} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import ContentLoader from 'react-content-loader'
import {useTranslation} from 'react-i18next'

const ExtraObj = React.memo(({listView = false, loading = false, page = 1, lastPage = 1, loadMore = null}) => {
    const {t} = useTranslation()
    const skeleton = useMemo(() => listView
        ?
            <ContentLoader
                className='note-element'
                speed={2}
                width={'100%'}
                height={78}
                backgroundColor='#1e2939' 
                foregroundColor='#72bf00'
                aria-label={undefined}
                title={undefined}
                preserveAspectRatio='none'
            >
                {/* 
                    rx & ry -- border-radius
                    x -- расположение по горизонтали
                    y -- расположение по вертикали
                */}
                {/* title */}
                <rect x='5' y='0' rx='4' ry='4' width='30%' height='20'/>
                {/* desc */}
                <rect x='5' y='30' rx='3' ry='3' width='40%' height='20'/>
                {/* tags */}
                <rect x='66%' y='15' rx='3' ry='3' width='70' height='25'/>
                <rect x='74%' y='15' rx='3' ry='3' width='50' height='25'/>
                <rect x='80%' y='15' rx='3' ry='3' width='50' height='25'/>
                {/* date */}
                <rect x='86%' y='20' rx='3' ry='3' width='60' height='18'/>
            </ContentLoader>
        :
            <ContentLoader
                className='note-element'
                speed={2}
                width={345}
                height={120}
                backgroundColor='#1e2939' 
                foregroundColor='#72bf00'
                aria-label={undefined}
                title={undefined}
                preserveAspectRatio='none'
            >
                {/* 
                    rx & ry -- border-radius
                    x -- расположение по горизонтали
                    y -- расположение по вертикали
                */}
                {/* title */}
                <rect x='5' y='5' rx='4' ry='4' width='200' height='20'/>
                {/* desc */}
                <rect x='5' y='34' rx='3' ry='3' width='320' height='20'/>
                {/* tags */}
                <rect x='5' y='65' rx='3' ry='3' width='70' height='25'/>
                <rect x='85' y='65' rx='3' ry='3' width='50' height='25'/>
                <rect x='145' y='65' rx='3' ry='3' width='50' height='25'/>
                {/* date */}
                <rect x='275' y='71' rx='3' ry='3' width='40' height='18'/>
            </ContentLoader>
    , [listView])

    const motionProps = useMemo(() => ({
        className: `--notransitions note-animated-element ${listView ? '--checked' : ''}`,
        style: {
            willChange: 'transform, opacity, height',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
        },
        layout: true,
        viewport: {
            once: false,
            amount: 0.1,
            margin: '0px 0px 0px 0px'
        },
        initial: {
            opacity: 0,
            scale: 0.9
        },
        whileInView: {
            opacity: 1,
            scale: 1
        },
        transition: {
            layout: { 
                type: 'spring', 
                stiffness: 300, 
                damping: 30
            },
            default: { 
                duration: 0.3, 
                ease: 'easeInOut'
            },
            opacity: {duration: 0.3}
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.3
            }
        }
    }), [listView])

    return (
        <AnimatePresence>
        {/* loading skeleton */}
            {loading ?
                <motion.div
                {...motionProps}
                >
                    {skeleton}
                </motion.div>
            : null}
        {/* load more button */}
            {(page < lastPage) && !loading ?
                <motion.div
                    onClick={loadMore}
                    {...motionProps}
                >
                    <div
                        className='load-more-button'
                    >
                        <span
                            className='load-more-text'
                        >
                            {t('Load more')}
                        </span>
                    </div>
                </motion.div>
            : null}
        </AnimatePresence>
    )
})

export default ExtraObj