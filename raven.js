let Raven = (x,y) => {
    let state = {
        standing: 0,
        looking: 1,
    };
    let transition = NoImageTransition(ravenStanding);
    return {
        x: x,
        y: y,
        transition: transition,
        images: transition.images,
        alphas: transition.alphas,
        state: state.standing,
        update: function(timePassed) {
            // console.log(`updating raven`);
            this.transition.update(timePassed);
            this.images = this.transition.images;
            this.alphas = this.transition.alphas;
            if (this.transition.done) {
                // console.log(`done`);
                if (this.state === 0 && Math.random() > .999) {
                    // console.log(`looking`);
                    this.transition = LinearImageTransition(ravenStanding, ravenLooking);
                    this.state = state.looking;
                }
                else if (this.state === 1 && Math.random() > .99) {
                    // console.log(`standing`);
                    this.transition = LinearImageTransition(ravenLooking, ravenStanding);
                    this.state = state.standing;
                }
            }
        },
    };
};