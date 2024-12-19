# CS:GO Inventory Calculator

A web application that calculates the total value of a Steam user's CS:GO inventory in real-time.

## Installation

1. Clone the repository:

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Server-Sent Events (SSE)

### Backend
- Node.js
- Express.js
- Steam Web API

## Detailed Features

- **Real-Time Querying**: Uses Server-Sent Events to display progress in real-time
- **Responsive Design**: Interface adaptable to different screen sizes
- **Error Handling**: Robust error handling system with clear messages
- **Price Caching**: Optimization of Steam Market API queries

## How to Get Your Steam ID

1. Visit [steamid.io](https://steamid.io)
2. Enter your Steam username or profile URL
3. Copy the SteamID64 (format: 765611XXXXXXXXXX)

## Troubleshooting

### Common Errors

1. **Server Connection Error**
   - Verify that the server is running on port 5000
   - Check that the Steam API Key is valid

2. **Inventory Not Available**
   - Make sure your Steam inventory is public
   - Verify that the Steam ID is correct

3. **Price Calculation Error**
   - May occur due to Steam API rate limits
   - Wait a few minutes and try again

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
