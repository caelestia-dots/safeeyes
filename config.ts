export default {
    prepTime: 10, // Seconds
    short: {
        interval: 15, // Minutes
        length: 15, // Seconds
        prompts: [
            "Tigntly close your eyes",
            "Roll your eyes a few times to each side",
            "Rotate your eyes in clockwise direction",
            "Rotate your eyes in counter clockwise direction",
            "Blink your eyes",
            "Focus on a point in the far distance",
            "Have some water",
        ],
    },
    long: {
        interval: 60, // Minutes, must be a multiple of the short interval
        length: 60, // Seconds
        prompts: [
            "Walk for a while",
            "Lean back at your seat and relax",
            "Do 20 push ups",
            "Do 10 pull ups",
            "Do some stretches",
        ],
    },
};
