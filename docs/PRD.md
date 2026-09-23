**EVENTBRITE \- MICHELLE & MARA**  
*Product Requirements Document: Net New Build*

**Build name: RSVP**

**Owner:**  Michelle Sainsbury & Mara Munoz

**Date: 9/22/2026**

# **1\. PROBLEM**

Event organizers struggle to efficiently manage attendee registration and entry, particularly for events with large guest lists. Disconnected or manual check-in processes can lead to long entry lines, duplicate or invalid entries, and inaccurate attendance records. As a result, organizers have difficulty creating a smooth entry experience and accurately understanding event turnout.

### **Supporting Context (optional)**

* Attendance is a core success metric for event teams.\*\* In the 2025 Splash Events Outlook Report, 59% of marketers identified attendance rate as a metric they care about when evaluating event success, while 47% identified event registrations. This supports the need for organizers to accurately track the difference between who registers and who actually attends. (Splash Events Outlook Report 2025, cited by Cvent)  
* Event data is often fragmented across multiple tools.\*\* The 2025 ICE Benchmarking Report found that 79% of event teams use multiple platforms for their event data, while only 24% have fully integrated their event technology and marketing/sales systems. This fragmentation can make it harder for organizers to maintain a clear, real-time picture of registrations and attendance. (ICE Benchmarking Report 2025, cited by Cvent)  
* Digital check-in can substantially reduce entry delays.\*\* In one Cvent customer case study, ADL reported a 50% reduction in average onsite check-in times after adopting digital event check-in. Another documented implementation reported attendee wait times falling by more than 50%, with check-in taking under 30 seconds per attendee. (Cvent customer case studies)

* Data/Research: Across 1,070+ live events, the median no-show rate was approximately 20%, meaning about 1 in 5 expected attendees did not check in. Free events had an even higher median no-show rate of approximately 28%. (PheedLoop Event Data Lab, 2026\)

* User pain point: Event organizers need to distinguish between people who registered and those who actually attended so they can maintain accurate attendance records and understand true event turnout.

* Market/competitive context: Eventbrite provides organizers with ticket scanning, manual check-in, real-time check-in counts, and attendance reporting—showing that efficient attendee check-in and tracking are established capabilities in the event-management market.

## **1a. Opportunity**

Opportunity: Create a streamlined registration and check-in experience that enables event organizers to quickly verify attendees, reduce entry delays, and accurately track who actually attends. Solving this problem gives organizers more reliable attendance data while improving the entry experience for attendees.

### **Market Opportunity**

* The global event-management software market is estimated at $18.4 billion in 2026 and is projected to reach $39.6 billion by 2033, representing an 11.5% compound annual growth rate. 

Grand View Research — Event Management Software Market⁠

* Event organizers and planners represented 40.1% of event-management software revenue in 2025\. These platforms are used for functions including registration, participant engagement, logistics, and analytics—directly relevant to your registration/check-in product.   

Grand View Research

## **1b. Users & Needs**

**Primary user(s):**  Event organizers and event staff who manage attendee registration and check-in and need a fast, reliable way to verify guests and track attendance.

**Secondary users:**  Registered event attendees who interact with the product during check-in and want a quick, smooth entry experience.

### **Key User Needs**

As an event organizer, I need to quickly verify registered attendees during check-in because slow or manual verification can create long entry lines and delays.

As an event organizer, I need to track who actually attends my event because registration totals alone do not provide an accurate picture of turnout.

# **2\. PROPOSED SOLUTION**

*RSVP is a web app that helps event organizers manage registration, entry, and attendance in one place. Attendees register for an event and receive a digital ticket, while RSVP manages event capacity and helps organizers keep track of who is expected to attend. When attendees arrive, organizers can quickly verify their registration and record their arrival. As a result, organizers can reduce check-in delays, avoid overcrowding, and maintain an accurate view of event attendance.*

## **2a. Value Proposition**

*Event organizers who struggle with slow check-ins, capacity management, and inaccurate attendance tracking use RSVP, a web app that manages the attendee journey from registration through event entry. Unlike manual guest lists or disconnected registration and check-in tools, RSVP keeps registration, digital tickets, waitlisting, and attendance connected in one place, helping organizers reduce entry delays and maintain an accurate view of who is attending.*

## **2b. Top 3 MVP Value Props**

* Vitamin (a baseline capability users expect): Give organizers one place to manage event registrations and track who is attending.  
* Painkiller (directly eliminates the most painful part of the problem): Replace slow, error-prone manual check-ins with quick digital ticket verification at the door.  
* Steroid (the standout moment that makes users choose you over alternatives): Automatically connect registration, QR check-in, waitlisting, and live attendance so organizers always know who is registered, waiting, and actually at the event.

## **2c. Goals & Non-Goals**

**Goals:**

* Give event organizers a simple way to manage attendees from registration through event entry.  
* Reduce the time and manual effort required to check attendees in.  
* Help organizers prevent duplicate or invalid event entries.  
* Give organizers an accurate, real-time view of registrations and actual attendance.  
* Make it easier to manage event capacity and overflow when an event fills up.

**Non-Goals:**

* Processing paid ticket purchases or refunds (deferred to a future version).  
* Event discovery, recommendations, or a public event marketplace (outside the MVP scope).  
* Advanced organizer analytics and reporting beyond basic registration and attendance tracking (deferred to a future version).

## **2d. Success Metrics**

| Goal | Signal | Metric | Target |
| ----- | ----- | ----- | ----- |
| Simplify attendee management | Organizers can manage registration through entry without switching tools | Task completion rate during testing | ≥ 90% complete the full workflow successfully |
| Reduce check-in time | Organizers can verify attendees quickly | Average time from QR scan to confirmed check-in | ≤ 5 seconds per attendee |
| Prevent duplicate or invalid entries | Previously used or invalid tickets are rejected | Duplicate/invalid ticket detection rate | 100% detected during testing |
| Provide accurate attendance tracking | Dashboard matches actual check-ins | Difference between recorded and actual attendance | 0 discrepancies during testing |
| Manage event capacity | Registration stops or waitlisting begins when capacity is reached | Correct capacity/waitlist handling rate | 100% of test cases handled correctly |

# **3\. REQUIREMENTS**

## **User Journey 1: Attendee registering for an event**

**Context:**  Attendees need a simple way to register for an event and provide the information necessary for organizers to verify them at entry.

**Sub-journey: Registering for an event**

* **\[P0\]**  User can view essential event details before registering.

  * **\[P0\]**  User can register for an event by providing required attendee information.

  * **\[P0\]**  User can receive a unique QR code after successful registration.

  * **\[P1\]**  User can view their registration details and QR code after registering.

  * **\[P2\]**  User can cancel their registration.

**Sub-journey: Arriving at the event**

* **\[P0\]**  User can present their QR code for check-in.

  * **\[P0\]**  User can be identified as a registered attendee when their QR code is scanned.

  * **\[P1\]**  User can receive confirmation that check-in was completed.

## **Sub-journey: Joining and moving through the waitlist**

## **\[P0\]  User can join a waitlist when an event has reached capacity.**

## **\[P0\]  User can be moved from the waitlist into registration when a spot becomes available.**

## **\[P1\]  UseSub-journey: Creating an event**

## **\[P0\]  User can create an event with essential details, including event name, date, time, location, and capacity.**

## **\[P0\]  User can make the event available for attendee registration.**

## 

## **User can receive confirmation when a spot becomes available and their registration is confirmed.**

## **User Journey 2: Event organizer managing attendee check-in**

**Context:**  Event organizers and staff need to move registered attendees through entry efficiently while maintaining an accurate record of who \[P0\]  User can see a clear warning when a QR code has already been used for check-in and the duplicate entry is not recorded.

actually attended.

**Sub-journey: Viewing registered attendees**

* **\[P0\]**  User can view the list of registered attendees for an event.

  * **\[P0\]**  User can search for a registered attendee by identifying information.

  * **\[P1\]**  User can view an attendee's registration status.

**Sub-journey: Checking in attendees**

* **\[P0\]**  User can scan an attendee's QR code to verify registration.

  * **\[P0\]**  User can check in a valid registered attendee after scanning the QR code.

  * **\[P0\]**  User can see when a QR code is invalid or does not match a valid registration.

  * **\[P1\]**  User can undo an incorrect check-in.

  * **\[P2\]** User can manually add a walk-in attendee if QR scanning is unavailable.

**Sub-journey: Tracking attendance**

* **\[P0\]**  User can view the number of registered attendees who have checked in.

  * **\[P0\]**  User can distinguish between registered attendees who attended and those who did not check in.

  * **\[P1\]**  User can view an attendance summary after the event.

  * **\[P2\]**  User can export attendance records.

# **4\. APPENDIX**

### **Supporting Research**

* 59% of marketers consider attendance rate an important measure of event success. *(Splash Events Outlook Report, 2025\)*  
* 79% of event teams use multiple platforms for event data. *(ICE Benchmarking Report, 2025\)*  
* Digital check-in helped one organization reduce average check-in times by 50%. *(Cvent/ADL Case Study)*

### **Technical Constraints**

* RSVP's MVP must be achievable within a one-week development period.  
* The project will use free or existing development tools and services.  
* Real payment processing is outside the MVP scope.  
* The core workflow is registration → QR ticket → check-in → live attendance tracking.

### **Open Questions**

* Will the waitlist be included in the MVP or treated as a stretch goal?  
* How should cancellations and movement from the waitlist into available spots work?  
* What attendee information should organizers be able to view or collect?

### **Future Considerations**

Potential future additions include advanced attendance analytics, automated waitlist management, paid ticketing, and additional organizer tools.
