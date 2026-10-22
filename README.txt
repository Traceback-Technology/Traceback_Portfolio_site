TRACEBACK-TECHNOLOGY WEBSITE (with feedback form backend)
=========================================================

FOLDER LAYOUT
  public/            The website itself (all pages, style.css, contact.js, images/)
  server.js          Node/Express server: serves public/ and handles POST /api/contact
  package.json       Lists the Node dependencies
  .env.example       Template for your email settings (copy to .env)

TO JUST LOOK AT THE WEBSITE (no feedback form)
  1. Extract the ZIP and open the folder in VS Code.
  2. Right-click public/index.html and choose "Open with Live Server".
  The pages work this way, but the feedback form cannot send anything, because
  Live Server has no backend. The form will tell the visitor the service is unavailable.

TO RUN THE WEBSITE WITH THE WORKING FEEDBACK FORM
  1. Install Node.js (https://nodejs.org) if you don't have it.
  2. Open the folder in VS Code, then open the terminal (Terminal > New Terminal).
  3. Run:  npm install
  4. Copy .env.example to a new file called .env and fill in your SMTP details
     (host, port, username, password) and CONTACT_RECEIVER_EMAIL, the inbox that
     should receive feedback. Never share or upload the .env file.
  5. Run:  npm start
  6. Open http://localhost:3000 in your browser.
  Email only gets delivered if the SMTP settings are valid. If they are missing or
  wrong, the visitor sees a friendly error and the real reason is printed in the terminal.

WHAT CHANGED IN THIS VERSION
  public/team.html      Thabang's credential is now "Robotics Engineer" (was Hardware Engineer).
  public/index.html     Team call-to-action now says "frontend, backend and robotics" instead of "hardware".
  public/products.html  Now a concise overview: BC Ways and BC Eats summaries, how they fit together, and a
                        button to the Project Showcase. Future Ideas removed. The empty "What Users Are
                        Saying" section removed (no reviews exist yet, and we avoid empty sections).
  public/showcase.html  Now the detailed page: what the project is, the problem, how BC Ways and BC Eats
                        work, intended value, screenshots area, walkthrough video area, feedback form.
                        The "Want the bigger picture?" section is gone.
  public/style.css      Added form styles (everything else unchanged).
  public/contact.js     NEW. Sends the form to POST /api/contact and shows success or error messages.
  server.js, package.json, .env.example, README.txt   NEW. The backend.
  Project facts on the Showcase page come from the Group 10 project proposal.


STILL NEEDS MANUAL CONFIGURATION OR TESTING
  - Real SMTP settings and receiving email address in .env.
  - Send a real test message and confirm it arrives and replying works.
  - Real BC Ways / BC Eats download or access URLs (comments in products.html).
  - Real app screenshots and a walkthrough video (comments in showcase.html).
  - Both real logo files (header comment in each page). Only a stand-in logo is included.
  - Team photographs.
  - Confirm the spellings "Arnold Mabope" and "Tetelo Phahladira" (used as written in the project proposal).
