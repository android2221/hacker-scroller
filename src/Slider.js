// Import Swiper React components
import SwiperCore, { Navigation, Pagination, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";

// Import Swiper styles
import 'swiper/swiper.scss';
import './Slider.scss';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Virtual]);

class Slider extends Component {
    constructor() {
        super();
        this.state = {
            topStories: [],
            storyData: [],
            currentStoriesSlice: [],
            currentOffset: 10,
            storiesToLoad: 10,
            loading: true,
        }
    }

    async componentDidMount() {
        this.getData();
    }

    slideChange(swiper) {
        var slideIndex = swiper.activeIndex;
        if (slideIndex >= (this.state.currentOffset - this.state.storiesToLoad ) - 2){
            this.getData();
            swiper.update();
        }
        swiper.update();
    }

    async getData(){
        this.setState({loading: true});
        
        var startIndex = this.state.currentOffset - this.state.storiesToLoad;
        
        const topStoriesResult = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
        const topStoriesJson = await topStoriesResult.json();
        const currentStoriesSlice = topStoriesJson.slice(startIndex, this.state.currentOffset);

        var storyDataArray = await Promise.all(currentStoriesSlice.map(async (x) => {
            var result = await fetch(`https://hacker-news.firebaseio.com/v0/item/${x}.json`);
            return result.json();
        }));
        
        var currentDataArray = this.state.storyData;

        currentDataArray.push(...storyDataArray);

        var newOffset = this.state.currentOffset + this.state.storiesToLoad;

        this.setState({
            topStories: topStoriesJson,
            storyData: currentDataArray,
            currentStoriesSlice: currentStoriesSlice,
            currentOffset: newOffset,
            loading: false
        });
    }

    render() {
        if (this.state.storyData.length > 0) {
            const list = this.state.storyData.map(story => {
                // Handle things that don't have a URL
                // Go to hacker news if not

                var calculatedUrl;
                var displayUrl;

                if (story.url) {
                    var urlParts = story.url.split('/');
                    calculatedUrl = story.url;
                    displayUrl = urlParts[2];
                } else {
                    displayUrl = 'news.ycombinator.com';
                    calculatedUrl = `https://news.ycombinator.com/item?id=${story.id}`;
                }

                return (
                    <SwiperSlide key={story.id} id={story.id}>
                        <div className="hacker-card">
                            <div className='story-title'>
                                <a href={calculatedUrl}>
                                    {story.title}
                                </a>
                            </div>
                            <div className='story-url'>{displayUrl}</div>
                        </div>
                    </SwiperSlide>
                )
            });
            return (
                <div className='slider-container'>
                    <Swiper
                        spaceBetween={50}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        onSlideChange={(swiper) => this.slideChange(swiper)}
                        direction='vertical'>
                        {list}
                    </Swiper>
                    <div id='loading-icon' className='loading'>
                        <ClipLoader size={35} color='black' loading={this.state.loading} />
                    </div>
                </div>
            );
        }
        return (
            <div id='loading-icon' className='loading'>
                <ClipLoader size={35} color='black' loading={this.state.loading} />
            </div>
        );
    }
}

export default Slider;