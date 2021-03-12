// Import Swiper React components
import SwiperCore, { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import React, { Component } from "react";

// Import Swiper styles
import 'swiper/swiper.scss';
import './Slider.scss';

// install Swiper modules
SwiperCore.use([Navigation, Pagination]);

class Slider extends Component{
    constructor(){
        super();
        this.state = { topStories: [], storyData: []}
    }

    componentDidMount() {
        fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`)
            .then(res => res.json())
            .then(json => this.setState({ topStories: json }));
    }

    render() {

        const list = this.state.topStories.map(story => <SwiperSlide><div className="hacker-card">{story}</div></SwiperSlide> );

        return (
            <div className='sliderContainer'>
                
                <Swiper
                    spaceBetween={50}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    onSlideChange={() => console.log('slide change')}
                    onSwiper={(swiper) => console.log(swiper)}
                    loop={true}>
                    {list}
                </Swiper>
            </div>

        );
        }
}

export default Slider;