import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    console.log('💳 ========================================');
    console.log('💳 RAZORPAY CREATE ORDER - START');
    console.log('💳 ========================================');
    
    try {
        // STEP 1: AUTHENTICATION
        console.log('🔐 STEP 1: Authenticating user...');
        const base44 = createClientFromRequest(req);
        let user;
        
        try {
            user = await base44.auth.me();
            if (!user) {
                console.error('❌ Authentication failed: No user found');
                return Response.json({ error: 'Unauthorized - Please login' }, { status: 401 });
            }
            console.log('✅ User authenticated:', user.email);
            console.log('   User ID:', user.id);
        } catch (authError) {
            console.error('❌ Authentication error:', authError.message);
            return Response.json({ error: 'Authentication failed' }, { status: 401 });
        }

        // STEP 2: PARSE REQUEST
        console.log('\n📋 STEP 2: Parsing request body...');
        let body;
        
        try {
            const requestText = await req.text();
            console.log('   Raw request body:', requestText);
            body = JSON.parse(requestText);
            console.log('✅ Request parsed successfully');
        } catch (parseError) {
            console.error('❌ Failed to parse request:', parseError.message);
            return Response.json({ error: 'Invalid request format' }, { status: 400 });
        }

        const { amount, plan_type, currency = 'INR' } = body;
        console.log('   Amount:', amount);
        console.log('   Plan Type:', plan_type);
        console.log('   Currency:', currency);

        // Validate inputs
        if (!amount || !plan_type) {
            console.error('❌ Missing required fields');
            return Response.json({ 
                error: 'Missing required fields: amount and plan_type are required'
            }, { status: 400 });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            console.error('❌ Invalid amount:', amount);
            return Response.json({ 
                error: 'Invalid amount. Must be a positive number'
            }, { status: 400 });
        }

        // STEP 3: GET RAZORPAY CREDENTIALS
        console.log('\n🔑 STEP 3: Loading Razorpay credentials...');
        const keyId = Deno.env.get('RAZORPAY_API_KEY');
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRECT');

        console.log('   Environment variables check:');
        console.log('   - RAZORPAY_API_KEY exists:', !!keyId);
        console.log('   - RAZORPAY_KEY_SECRECT exists:', !!keySecret);

        if (keyId) {
            console.log('   - Key ID preview:', keyId.substring(0, 12) + '...');
            console.log('   - Key ID length:', keyId.length);
        }
        if (keySecret) {
            console.log('   - Secret length:', keySecret.length);
        }

        if (!keyId || !keySecret) {
            console.error('❌ CRITICAL: Razorpay credentials not found');
            return Response.json({ 
                error: 'Payment gateway not configured. Please contact support.',
                details: 'Missing Razorpay credentials'
            }, { status: 500 });
        }

        // Validate credential format
        if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
            console.error('❌ Invalid Razorpay Key ID format');
            return Response.json({ 
                error: 'Invalid payment gateway configuration',
                details: 'Razorpay Key ID has invalid format'
            }, { status: 500 });
        }

        console.log('✅ Credentials loaded and validated');

        // STEP 4: PREPARE ORDER
        console.log('\n💰 STEP 4: Preparing Razorpay order...');
        const amountInPaise = Math.round(Number(amount) * 100);
        
        console.log('   Amount conversion:');
        console.log('   - Input amount:', amount);
        console.log('   - Currency:', currency);
        console.log('   - Amount in paise:', amountInPaise);

        // Create short receipt ID (max 40 chars for Razorpay)
        const timestamp = Date.now().toString().slice(-8);
        const userIdShort = user.id.substring(0, 8);
        const receiptId = `hlsy_${userIdShort}_${timestamp}`;
        console.log('   Receipt ID:', receiptId, `(${receiptId.length} chars)`);

        // Prepare order payload (exactly as Razorpay expects)
        const orderPayload = {
            amount: amountInPaise,
            currency: currency.toUpperCase(),
            receipt: receiptId
        };

        console.log('   Order payload:');
        console.log('   ', JSON.stringify(orderPayload, null, 2));

        // STEP 5: CREATE BASIC AUTH
        console.log('\n🔐 STEP 5: Creating Basic Auth header...');
        const authString = `${keyId}:${keySecret}`;
        console.log('   Auth string length:', authString.length);

        let base64Auth;
        try {
            base64Auth = btoa(authString);
            console.log('✅ Base64 encoding successful');
            console.log('   Base64 preview:', base64Auth.substring(0, 20) + '...');
        } catch (encodeError) {
            console.error('❌ Base64 encoding failed:', encodeError.message);
            return Response.json({ 
                error: 'Authentication encoding failed' 
            }, { status: 500 });
        }

        // STEP 6: CALL RAZORPAY API
        console.log('\n📡 STEP 6: Calling Razorpay API...');
        console.log('   URL: https://api.razorpay.com/v1/orders');
        console.log('   Method: POST');

        let razorpayResponse;

        try {
            razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${base64Auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });
            
            console.log('✅ Razorpay API call completed');
            console.log('   Status:', razorpayResponse.status);
            console.log('   Status Text:', razorpayResponse.statusText);
        } catch (error) {
            console.error('❌ Fetch error:', error.message);
            return Response.json({ 
                error: 'Network error calling Razorpay',
                details: error.message 
            }, { status: 500 });
        }

        // STEP 7: READ RESPONSE
        console.log('\n📥 STEP 7: Reading Razorpay response...');
        let responseText;
        
        try {
            responseText = await razorpayResponse.text();
            console.log('   Response length:', responseText.length);
            console.log('   Response body:', responseText);
        } catch (readError) {
            console.error('❌ Failed to read response:', readError.message);
            return Response.json({ 
                error: 'Failed to read Razorpay response' 
            }, { status: 500 });
        }

        // STEP 8: HANDLE RESPONSE
        console.log('\n🔍 STEP 8: Processing response...');
        
        if (!razorpayResponse.ok) {
            console.error('❌ Razorpay API returned error status:', razorpayResponse.status);
            
            let errorData;
            try {
                errorData = JSON.parse(responseText);
                console.error('   Error details:', JSON.stringify(errorData, null, 2));
            } catch {
                errorData = { message: responseText };
            }

            // Handle specific Razorpay errors
            if (razorpayResponse.status === 400) {
                console.error('❌ 400 Bad Request - Invalid parameters or credentials');
                return Response.json({ 
                    error: 'Invalid payment request',
                    details: errorData.error?.description || errorData.error?.message || 'Please check your Razorpay API keys',
                    razorpay_error: errorData
                }, { status: 400 });
            }
            
            if (razorpayResponse.status === 401) {
                console.error('❌ 401 Unauthorized - Invalid API keys');
                return Response.json({ 
                    error: 'Invalid Razorpay credentials',
                    details: 'Your Razorpay API keys are incorrect. Please update them in Settings → Environment Variables',
                    razorpay_error: errorData
                }, { status: 500 });
            }

            return Response.json({ 
                error: 'Razorpay API error',
                status: razorpayResponse.status,
                details: errorData
            }, { status: 500 });
        }

        // STEP 9: PARSE SUCCESS RESPONSE
        console.log('📦 STEP 9: Parsing success response...');
        let order;
        
        try {
            order = JSON.parse(responseText);
            console.log('✅ Response parsed successfully');
            console.log('   Order ID:', order.id);
            console.log('   Amount:', order.amount);
            console.log('   Currency:', order.currency);
            console.log('   Status:', order.status);
        } catch (parseError) {
            console.error('❌ Failed to parse success response:', parseError.message);
            return Response.json({ 
                error: 'Invalid response format from Razorpay' 
            }, { status: 500 });
        }

        // STEP 10: VALIDATE ORDER
        console.log('\n✔️ STEP 10: Validating order...');
        
        if (!order.id) {
            console.error('❌ Order ID missing in response');
            return Response.json({ 
                error: 'Invalid order data from Razorpay'
            }, { status: 500 });
        }

        console.log('✅ Order validation passed');

        // STEP 11: RETURN SUCCESS
        console.log('\n🎉 STEP 11: Sending success response...');
        const successResponse = {
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: keyId
        };

        console.log('   Success response:', JSON.stringify(successResponse, null, 2));
        console.log('\n💳 ========================================');
        console.log('💳 RAZORPAY CREATE ORDER - SUCCESS ✅');
        console.log('💳 ========================================\n');

        return Response.json(successResponse);

    } catch (error) {
        // CATCH-ALL ERROR HANDLER
        console.error('\n❌ ========================================');
        console.error('❌ UNEXPECTED ERROR IN CREATE ORDER');
        console.error('❌ ========================================');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('❌ ========================================\n');
        
        return Response.json({ 
            error: 'Internal server error',
            type: error.constructor.name,
            message: error.message
        }, { status: 500 });
    }
});