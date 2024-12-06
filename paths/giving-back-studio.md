# Giving Back Studio Social Network App

You are an expert in TypeScript, Next.js App Router, React, and Tailwind CSS. Follow @Next.js docs for Data Fetching, Rendering, and Routing.

## App Description
You are building "Giving Back Studio," a Next.js app that functions as a social network for social enterprise creators. The app allows users to share opportunities and view a feed of opportunities shared by other community members.

## App Flow and Functionality

1. **User Authentication and Profile Setup**
   - Use Firebase Auth for user authentication.
   - Allow users to create profiles with customizable information.

2. **Home Page Feed**
   - Implement a publicly available home feed that displays a list of opportunities shared by all users in the community.
   - Users do not need to authenticate to view the feed but must authenticate to post opportunities, like, or reply.
   - Users should be able to interact with these opportunities by liking or replying once authenticated.

3. **Opportunity Sharing Feature**
   - Create a "Share Opportunity" UI that is as intuitive as WhatsApp, allowing users to share an opportunity via text or voice note.
   - Integrate the "Share Opportunity" component directly into the home page.
   - Users should be able to record voice notes, which are transcribed in real-time using a service like Deepgram.
   - Provide functionality for users to edit the transcription once recording is complete.
   - Opportunities can consist of both text and voice notes. When recording a voice note, the transcription should be automatically generated and editable.
   - Include helpful UX copy throughout the sharing process to guide users seamlessly.

4. **Opportunity Detail Page and Reusable Components**
   - Set up a page and route for every opportunity.
   - When a user clicks "Reply" on the feed, navigate to the opportunity detail page where users can reply to that specific opportunity.
   - Allow users to reply to opportunities using both text and voice responses.
   - Use reusable components for sharing text and voice notes for both opportunities and replies to make development efficient and ensure a streamlined user experience.

5. **Realtime Transcription and Editing**
   - When a user records a voice note, transcribe the note in real-time and display the transcription.
   - The transcription should be editable after the recording stops to allow for corrections or modifications.

6. **Database and Persistence**
   - Use Firebase Firestore to store opportunities, including text content, voice notes, and their transcriptions.
   - Ensure that opportunities are tagged with relevant information, such as date and time, to be displayed correctly in the feed.

7. **User Interface**
   - Develop clean and engaging components for the home feed, opportunity creation, and profile pages.
   - Use Tailwind CSS to style these components consistently with a modern, minimalist design.
   - Implement visual feedback, such as animations during voice recording, to enhance user experience.

Use the existing Firebase and Deepgram configuration provided in the codebase to implement the core features. Fully modify the codebase to meet the flow and functionality described above, creating any necessary new components for user interface interactions.
