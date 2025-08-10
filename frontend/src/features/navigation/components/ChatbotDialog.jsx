import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBrandsAsync, selectBrands } from '../../brands/BrandSlice';
import { selectCategories, fetchAllCategoriesAsync } from '../../categories/CategoriesSlice';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ColorModeContext } from '../../../index';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectProducts, setCategoryFilter, setBrandFilter, toggleFilters, setPriceFilter } from '../../products/ProductSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';


export const ChatbotDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [drawerWidth, setDrawerWidth] = React.useState(400);
    const computeDrawerWidth = React.useCallback(() => {
        if (isMobile) return 0;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
        // Clamp between 280px and 400px, scale ~28% of viewport width for desktops/tablets
        const px = Math.round(Math.min(400, Math.max(280, vw * 0.28)));
        return px;
    }, [isMobile]);
    React.useEffect(() => {
        const update = () => setDrawerWidth(computeDrawerWidth());
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [computeDrawerWidth]);
    const navigate = useNavigate();
    const { mode, setThemeMode } = useContext(ColorModeContext);
    const [chatInput, setChatInput] = React.useState('');

    const dispatch = useDispatch();
    const brands = useSelector(selectBrands);
    const products = useSelector(selectProducts);
    const categories = useSelector(selectCategories);
    const loggedInUser = useSelector(selectLoggedInUser);


    React.useEffect(() => {
        if (open) {
            dispatch(fetchAllBrandsAsync());
            dispatch(fetchAllCategoriesAsync());
        }
    }, [open, dispatch]);

    React.useEffect(() => {
        if (brands && brands.length > 0) {
            console.log('Brands:', brands);
        }
    }, [brands]);

    const [chatMessages, setChatMessages] = React.useState(() => {
        const saved = localStorage.getItem('chatbot_messages');
        return saved ? JSON.parse(saved) : [];
    });

    const chatContainerRef = React.useRef(null);

    React.useEffect(() => {
        localStorage.setItem('chatbot_messages', JSON.stringify(chatMessages));
        // Auto-scroll to bottom when new messages are added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Push/squeeze behavior with responsive width, disabled on mobile
    React.useEffect(() => {
        // If mobile, ensure no push and close the drawer if somehow opened
        if (isMobile) {
            document.body.style.marginRight = '0';
            if (open && onClose) onClose();
            return () => {
                document.body.style.marginRight = '0';
            };
        }

        if (open) {
            document.body.style.marginRight = `${drawerWidth}px`;
            document.body.style.transition = 'margin-right 0.3s ease';
        } else {
            document.body.style.marginRight = '0';
        }

        return () => {
            document.body.style.marginRight = '0';
        };
    }, [open, isMobile, drawerWidth, onClose]);

    const handleChatInputChange = (event) => {
        setChatInput(event.target.value);
    };

    // GPT Intent Detection Function
    const getIntentFromGPT = async (input) => {
        try {
            const response = await fetch("https://models.github.ai/inference/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.REACT_APP_GITHUB_GPT_TOKEN}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a chatbot that extracts intent from user input for an e-commerce website. 
                            
                            Examples:
                            - "show products of Nike" → productQuery
                            - "show me Nike products" → productQuery
                            - "I want to see Ideas brand" → productQuery
                            - "show shirts" → categoryQuery
                            - "show me kurtas" → categoryQuery
                            - "products under 5000" → priceQuery
                            - "Nike products under 3000" → productQuery,priceQuery
                            - "shirts under 2000" → categoryQuery,priceQuery
                            - "Nike shirts under 3000" → productQuery,categoryQuery,priceQuery
                            - "show me Nike kurtas under 5000" → productQuery,categoryQuery,priceQuery
                            - "Ideas shirts below 2500" → productQuery,categoryQuery,priceQuery
                            - "show all products" → clearFilters
                            - "show me all products" → clearFilters
                            - "clear all filters" → clearFilters
                            - "remove all filters" → clearFilters
                            - "reset filters" → clearFilters
                            - "show everything" → clearFilters
                            - "hello" → greeting
                            - "scroll down" → scrollDown
                            - "dark mode" → darkMode
                            
                            If the user input contains more than one intent (e.g., brand, category, and price), respond with all intents separated by commas.
                            
                            Possible intents: greeting, help, status, closeChat, scrollDown, scrollUp, lightMode, darkMode, goodbye, showCart, logOut, showProfile, showOrders, showHome, showWishlist, showBrands, showCategories, priceQuery, clearChat, productQuery, categoryQuery, clearFilters.
                            
                            Respond with only the intent(s), nothing else.`
                        },
                        {
                            role: "user",
                            content: input
                        }
                    ],
                    temperature: 0.1, // Lower temperature for more consistent results
                    max_tokens: 20,   // Shorter response
                    top_p: 1
                }),
            });

            const data = await response.json();
            return data.choices[0]?.message?.content?.trim();
        } catch (err) {
            console.error("GPT intent fetch failed:", err);
            return null;
        }
    };

    // GPT Conversational Response Function
    const getConversationalResponse = async (input) => {
        try {
            const currentDate = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const currentTime = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const response = await fetch("https://models.github.ai/inference/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.REACT_APP_GITHUB_GPT_TOKEN}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a helpful AI assistant integrated into an e-commerce website. You can help with general knowledge questions, provide information about current date/time, weather (though you cannot access real-time weather data, you can suggest checking weather apps), and have casual conversations. 
                            
                            Current date: ${currentDate}
                            Current time: ${currentTime}
                            
                            Keep responses concise and friendly. If asked about weather, suggest checking a weather app since you don't have real-time access. For questions about the website, mention you can help navigate (like "show cart", "go to home", etc.)`
                        },
                        {
                            role: "user",
                            content: input
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 150,
                    top_p: 1
                }),
            });

            const data = await response.json();
            return data.choices[0]?.message?.content?.trim();
        } catch (err) {
            console.error("GPT conversation fetch failed:", err);
            return "🤖 I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
        }
    };

    const generateContextualResponse = (intent, originalInput = '', confidence = 0) => {
        const responses = {
            greeting: ["👋 Hello! I'm your AI assistant.", "🤖 Hi there!", "✨ Greetings!", "🌟 Hey!"],
            help: ["🧠 I can help you with things like: 'Close chat', 'Scroll down/up', 'Light mode', 'Dark mode'"],
            status: ["📊 This is a chat sidebar designed to assist you with navigating the page, controlling themes, and closing the chat."],
            lightMode: ["☀️ Light mode activated!"],
            darkMode: ["🌙 Dark mode activated!"],
            goodbye: ["👋 Goodbye!", "✨ Take care!"],
            showCart: ["🛒 Here is your cart! Redirecting...", "🛍️ Taking you to your cart now!"],
            logOut: ["🛒 It's hard to see you going , Best of Luck", "🛍️ Good Luck!"],
            showProfile: ["🛒 Here is your Profile! Redirecting...", "🛍️ Taking you to your Profile now!"],
            showOrders: ["🛒 Here are your Orders! Redirecting...", "🛍️ Taking you to your Orders now!"],
            showHome: ["🛒 Here is your Home Page! Redirecting...", "🛍️ Taking you to your home now!"],
            showWishlist: ["🛒 Here is your WishList Page! Redirecting...", "🛍️ Taking you to your WishList now!"],
        };

        if (intent && responses[intent]) {
            const intentResponses = responses[intent];
            return intentResponses[Math.floor(Math.random() * intentResponses.length)];
        }

        return `🤔 I couldn't determine your intent. Try 'scroll down', 'dark mode', or 'close chat'.`;
    };

    const scrollPage = (direction) => {
        const scrollElement = document.scrollingElement || document.documentElement || document.body;
        scrollElement.scrollTo({
            top: direction === 'down' ? scrollElement.scrollHeight : 0,
            behavior: 'smooth'
        });
    };

    // Helper: Find brand by name (case-insensitive)
    const findBrandByName = (name) => {
        if (!brands) return null;
        return brands.find(
            b => b.name && b.name.toLowerCase() === name.toLowerCase()
        );
    };

    // Helper: Extract brand name from user input
    const extractBrandName = (input) => {
        if (!brands) return null;
        // Try to find a brand name mentioned in the input
        for (const b of brands) {
            if (b.name && input.toLowerCase().includes(b.name.toLowerCase())) {
                return b.name;
            }
        }
        return null;
    };

    // Helper: Find category by name (case-insensitive)
    const findCategoryByName = (name) => {
        if (!categories) return null;
        return categories.find(
            c => c.name && c.name.toLowerCase() === name.toLowerCase()
        );
    };

    // Helper: Extract category name from user input
    const extractCategoryName = (input) => {
        if (!categories) return null;
        for (const c of categories) {
            if (c.name && input.toLowerCase().includes(c.name.toLowerCase())) {
                return c.name;
            }
        }
        return null;
    };

    // Helper: Extract price from user input
    const extractMaxPrice = (input) => {
        const match = input.match(/(?:less than|under|below|<=?|maximum|upto|up to)\s*([0-9]+)/i);
        if (match) {
            return parseInt(match[1], 10);
        }
        return null;
    };



    const processCommand = async (input) => {
        const gptIntent = await getIntentFromGPT(input);
        const brandName = extractBrandName(input);
        const categoryName = extractCategoryName(input);
        const maxPrice = extractMaxPrice(input);

        console.log('Debug:', { gptIntent, brandName, categoryName, maxPrice }); // DEBUG LOG

        // FALLBACK: If GPT didn't detect intent but we found brand/category names, override the intent
        let finalIntent = gptIntent;
        if (!gptIntent || gptIntent === 'conversation') {
            if (brandName && /show|display|find|get|products|items/i.test(input)) {
                finalIntent = 'productQuery';
            } else if (categoryName && /show|display|find|get|products|items/i.test(input)) {
                finalIntent = 'categoryQuery';
            }
        }

        // **HANDLE CLEAR FILTERS FIRST** - Check for clear filters intent or keywords
        if (finalIntent === 'clearFilters' ||
            /show\s+(all|everything)|clear\s+(all\s+)?filters?|remove\s+(all\s+)?filters?|reset\s+filters?/i.test(input)) {

            dispatch(setBrandFilter([]));
            dispatch(setCategoryFilter([]));
            dispatch(setPriceFilter(undefined));
            // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
            navigate('/');
            return `🧹 All filters cleared! Showing you all products...`;
        }

        // **CLEAR ALL FILTERS FIRST** for any product/category/price query (except clearFilters)
        if (brandName || categoryName || maxPrice ||
            finalIntent === 'productQuery' || finalIntent?.includes('productQuery') ||
            finalIntent === 'categoryQuery' || finalIntent?.includes('categoryQuery') ||
            finalIntent === 'priceQuery' || /less than|under|below|<=?|maximum|upto|up to/i.test(input)) {

            dispatch(setBrandFilter([]));
            dispatch(setCategoryFilter([]));
            dispatch(setPriceFilter(undefined));
        }

        // If brand, category, and price are all present in the input
        if (brandName && categoryName && maxPrice) {
            const brand = findBrandByName(brandName);
            const category = findCategoryByName(categoryName);

            if (brand && category) {
                dispatch(setBrandFilter([brand._id]));
                dispatch(setCategoryFilter([category._id]));
                dispatch(setPriceFilter({ max: maxPrice }));
                // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
                navigate('/');
                return `🏃‍♂️ Showing you "${categoryName}" products from "${brandName}" priced up to ${maxPrice}...`;
            } else if (!brand && category) {
                return `Brand "${brandName}" not found.`;
            } else if (brand && !category) {
                return `Category "${categoryName}" not found.`;
            } else {
                return `Brand "${brandName}" and category "${categoryName}" not found.`;
            }
        }

        // If both brand and price are present in the input
        if (brandName && maxPrice) {
            const brand = findBrandByName(brandName);
            if (brand) {
                dispatch(setBrandFilter([brand._id]));
                dispatch(setPriceFilter({ max: maxPrice }));
                // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
                navigate('/');
                return `🏃‍♂️ Showing you products of "${brandName}" priced up to ${maxPrice}...`;
            } else {
                return `Brand "${brandName}" not found.`;
            }
        }

        // If both category and price are present in the input
        if (categoryName && maxPrice) {
            const category = findCategoryByName(categoryName);
            if (category) {
                dispatch(setCategoryFilter([category._id]));
                dispatch(setPriceFilter({ max: maxPrice }));
                // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
                navigate('/');
                return `🏃‍♂️ Showing you "${categoryName}" products priced up to ${maxPrice}...`;
            } else {
                return `Category "${categoryName}" not found.`;
            }
        }

        // If only brand is present (use finalIntent instead of gptIntent)
        if ((finalIntent === 'productQuery' || finalIntent?.includes('productQuery')) && brandName) {
            const brand = findBrandByName(brandName);
            if (brand) {
                dispatch(setBrandFilter([brand._id]));
                // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
                navigate('/');
                return `🏃‍♂️ Showing you products for "${brandName}"...`;
            } else {
                return `Brand "${brandName}" not found.`;
            }
        }

        // If only category is present (use finalIntent instead of gptIntent)
        if ((finalIntent === 'categoryQuery' || finalIntent?.includes('categoryQuery')) && categoryName) {
            const category = findCategoryByName(categoryName);
            if (category) {
                dispatch(setCategoryFilter([category._id]));
                // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
                navigate('/');
                return `🏃‍♂️ Showing you "${categoryName}" products...`;
            } else {
                return `Category "${categoryName}" not found.`;
            }
        }

        // If only price is present
        if (finalIntent === 'priceQuery' || /less than|under|below|<=?|maximum|upto|up to/i.test(input)) {
            if (maxPrice) {
                dispatch(setPriceFilter({ max: maxPrice }));
                // ❌ REMOVE THIS LINE: dispatch(toggleFilters());
                navigate('/');
                return `🏃‍♂️ Showing you products priced up to ${maxPrice}...`;
            } else {
                return "Please specify a maximum price (e.g., 'show me products less than 3000').";
            }
        }

        // Show categories list if user asks
        if (gptIntent === 'showCategories') {
            if (categories && categories.length > 0) {
                const categoryList = categories.map(c => `• ${c.name}`).join('\n');
                return `📂 Here are all the categories:\n${categoryList}`;
            } else {
                return "Sorry, I couldn't find any categories right now.";
            }
        }

        // 3. Handle conversational/general knowledge queries
        if (gptIntent === 'conversation' || gptIntent === null) {
            return await getConversationalResponse(input);
        }

        // 4. Handle specific intent actions
        switch (gptIntent) {
            case 'closeChat': setTimeout(() => onClose(), 1000); return generateContextualResponse('goodbye');
            case 'scrollDown': scrollPage('down'); return '📜 Scrolling down...';
            case 'scrollUp': scrollPage('up'); return '📜 Scrolling to the top...';
            case 'lightMode': setThemeMode('light'); return generateContextualResponse('lightMode');
            case 'darkMode': setThemeMode('dark'); return generateContextualResponse('darkMode');
            case 'greeting':
            case 'help':
            case 'status': return generateContextualResponse(gptIntent);
            case 'goodbye': setTimeout(() => onClose(), 1000); return generateContextualResponse('goodbye');
            case 'showCart': setTimeout(() => navigate('/cart'), 1500); return generateContextualResponse('showCart');
            case 'logOut':
                // Clear chat messages before logout
                setChatMessages([]);
                localStorage.removeItem('chatbot_messages');
                localStorage.setItem('chatbot_open', 'false');
                setTimeout(() => navigate('/logout'), 1500);
                return generateContextualResponse('logOut');
            case 'showProfile': setTimeout(() => navigate('/profile'), 1500); return generateContextualResponse('showProfile');
            case 'showOrders': setTimeout(() => navigate('/orders'), 1500); return generateContextualResponse('showOrders');
            case 'showWishlist': setTimeout(() => navigate('/wishlist'), 1500); return generateContextualResponse('showWishlist');
            case 'showHome': setTimeout(() => navigate('/'), 1500); return generateContextualResponse('showHome');
            case 'showBrands':
                if (brands && brands.length > 0) {
                    const brandList = brands.map(b => `• ${b.name || b.title || b}`).join('\n');
                    return `🛍️ Here are all the brands:\n${brandList}`;
                } else {
                    return "Sorry, I couldn't find any brands right now.";
                }
            case 'clearChat':
                setChatMessages([]); // Clear chat history
                setTimeout(() => onClose(), 500); // Close chat after a short delay
                return "🧹 Chat cleared. Closing chat...";
            default: return await getConversationalResponse(input);
        }
    };

    const handleSendChatMessage = async () => {
        if (chatInput.trim() === '') return;
        const newUserMessage = { sender: 'user', text: chatInput };
        setChatMessages(prev => [...prev, newUserMessage]);
        setChatInput(''); // Clear input immediately

        // Show "AI is thinking..." message
        setChatMessages(prev => [...prev, { sender: 'bot', text: '🤖 AI is thinking...' }]);

        const botReply = await processCommand(newUserMessage.text);

        // Replace "AI is thinking..." with actual reply
        setChatMessages(prev => [
            ...prev.slice(0, -1), // Remove last message ("AI is thinking...")
            { sender: 'bot', text: botReply }
        ]);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendChatMessage();
        }
    };

    // Web Speech API state
    const [listening, setListening] = React.useState(false);
    const recognitionRef = React.useRef(null);
    const autoSendTimerRef = React.useRef(null);

    // Initialize SpeechRecognition only once
    React.useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setChatInput(transcript);
            setListening(false);

            // Clear any existing timer
            if (autoSendTimerRef.current) {
                clearTimeout(autoSendTimerRef.current);
            }

            // Set timer to automatically send after 0.5 seconds
            autoSendTimerRef.current = setTimeout(async () => {
                if (transcript.trim() !== '') {
                    // Create the message objects
                    const newUserMessage = { sender: 'user', text: transcript };
                    setChatMessages(prev => [...prev, newUserMessage]);

                    // Process the command and send bot reply (now async)
                    const botReply = await processCommand(transcript);
                    setTimeout(() => {
                        setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
                    }, 500);

                    // Clear the input
                    setChatInput('');
                }
            }, 500);
        };

        recognitionRef.current.onend = () => setListening(false);
        recognitionRef.current.onerror = () => setListening(false);

        // Cleanup function
        return () => {
            if (autoSendTimerRef.current) {
                clearTimeout(autoSendTimerRef.current);
            }
        };
    }, []);

    // Start/stop listening
    const handleMicClick = () => {
        if (!recognitionRef.current) return;
        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
            // Clear the auto-send timer if user manually stops
            if (autoSendTimerRef.current) {
                clearTimeout(autoSendTimerRef.current);
            }
        } else {
            setListening(true);
            recognitionRef.current.start();
        }
    };

    React.useEffect(() => {
        if (open && chatMessages.length === 0) {
            const initialMessage = {
                sender: 'bot',
                text: '🧠 Hello! I can help you navigate the site ("scroll down", "show cart") and answer general questions. Ask me anything!'
            };
            setChatMessages([initialMessage]);
        }
    }, [open]);

    // Clear chat history when user logs out
    React.useEffect(() => {
        if (!loggedInUser) {
            setChatMessages([]);
            localStorage.removeItem('chatbot_messages');
        }
    }, [loggedInUser]);

    // Do not render chatbot on mobile (placed here to avoid conditional hooks)
    if (isMobile) {
        return null;
    }

    return (
        <Drawer anchor="right" open={open} onClose={onClose} variant="persistent" sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                borderLeft: `1px solid ${theme.palette.divider}`,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            },
        }}>
            {/* Fixed Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                position: 'sticky',
                top: 0,
                zIndex: 1,
                flexShrink: 0
            }}>
                <Typography variant="h6">Chat with Us</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>

            {/* Scrollable Chat Area */}
            <Box
                ref={chatContainerRef}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {chatMessages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            mb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: msg.sender === 'user'
                                    ? theme.palette.primary.main
                                    : theme.palette.mode === 'light'
                                        ? theme.palette.grey[200]
                                        : theme.palette.grey[800],
                                color: msg.sender === 'user'
                                    ? '#ffffff !important'
                                    : theme.palette.mode === 'light'
                                        ? theme.palette.text.primary
                                        : theme.palette.grey[100],
                                borderRadius: '8px',
                                p: 1,
                                maxWidth: '85%',
                                wordBreak: 'break-word',
                                boxShadow: msg.sender === 'bot' ? '0px 1px 3px rgba(0,0,0,0.3)' : 'none',
                            }}
                        >
                            {typeof msg.text === 'string' ? (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                        color: msg.sender === 'user' ? '#ffffff !important' : 'inherit'
                                    }}
                                >
                                    {msg.text}
                                </Typography>
                            ) : (
                                msg.text
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Fixed Footer Input */}
            <Box sx={{
                display: 'flex',
                gap: 1,
                p: 2,
                backgroundColor: theme.palette.background.default,
                borderTop: `1px solid ${theme.palette.divider}`,
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
                flexShrink: 0
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Ask me anything..."
                    value={chatInput}
                    onChange={handleChatInputChange}
                    onKeyPress={handleKeyPress}
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={2}
                    sx={{
                        '& .MuiInputBase-inputMultiline': {
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflow: 'auto',
                        }
                    }}
                />
                <IconButton
                    color={listening ? "primary" : "default"}
                    onClick={handleMicClick}
                    sx={{ bgcolor: listening ? "rgba(0,0,0,0.08)" : "inherit" }}
                >
                    <MicIcon />
                </IconButton>
                <Button variant="contained" onClick={handleSendChatMessage} disabled={chatInput.trim() === ''}>
                    <SendIcon />
                </Button>
            </Box>
        </Drawer>
    );
};