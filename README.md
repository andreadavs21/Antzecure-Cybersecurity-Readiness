Antzecure — Cybersecurity Readiness & Incident Response Plan tool

Built to Protect Your Colony
Antzecure is a web-based cybersecurity readiness tool designed to help small businesses and nonprofit organizations prepare for cybersecurity incidents, even if they have little or no technical experience.
The project helps organizations understand their current cybersecurity practices, identify areas for improvement, and create a personalized incident response plan based on their answers.
Antzecure focuses on making cybersecurity simple, accessible, and actionable.

About the Project
Many small organizations do not have a dedicated cybersecurity team or a formal plan for responding to cyberattacks.
When an incident happens, employees may not know who to contact, what actions to take, or how to protect important information.
Antzecure addresses this problem by providing a guided cybersecurity assessment and practical resources that organizations can use before and during an incident.

.
Features
1. Cybersecurity Readiness Assessment
A guided questionnaire with 20 questions organized around the six functions of the NIST Cybersecurity Framework (CSF) 2.0:
Function	Purpose
Govern	Understand who is responsible for cybersecurity
Identify	Identify important systems and sensitive information
Protect	Review existing security practices
Detect	Understand how suspicious activity is noticed
Respond	Evaluate how the organization handles incidents
Recover	Review backup and recovery readiness

2. Personalized Cybersecurity Recommendations
After completing the questionnaire, Antzecure analyzes the organization's answers and generates recommendations based on identified gaps.
Recommendations are grouped into three priority levels:
* High Priority: Important issues that should be addressed first.
* Medium Priority: Improvements that strengthen cybersecurity readiness.
* Low Priority: Existing practices to maintain or improve.
The recommendations are based on predefined rules aligned with NIST CSF 2.0.
Users can download a personalized recommendations report as a PDF.

3. Your First Steps
Antzecure highlights up to three important actions based on the organization's assessment results.
This helps users understand where to begin without reading the entire recommendations report.

4. Customized Incident Response Plan
Antzecure generates a printable incident response plan using information collected from the questionnaire.
The plan focuses on three simple steps:
01 — Stop the Spread
Recognize suspicious activity, stop using affected devices, and take appropriate steps to limit further harm.
02 — Report It
Know who to contact, including the person responsible within the organization, IT support, and appropriate outside organizations.
03 — Recover and Follow Up
Work with the responsible people to restore normal operations, communicate updates, and document lessons learned.
The plan is designed to help employees understand what to do during a cybersecurity incident without requiring advanced technical knowledge.

5. Emergency Contact Card
A printable reference card that helps organizations document important emergency information, including:
* Primary emergency contact
* Alternate contact
* IT support information
* Important phone numbers
* Backup and recovery information
* 
6. Practice Your Response — 20-Minute Exercise
Antzecure includes a customizable tabletop exercise that helps organizations practice responding to a fictional cybersecurity incident.
The exercise includes four timed activities:


Available scenarios include ransomware, phishing, email account takeover, payment fraud, and sensitive information exposure.
The exercise is discussion-only and does not require users to change real systems.

How Personalization Works
Antzecure uses a rule-based approach to generate its recommendations and resources.
The website evaluates answers such as:
* Organization size
* Available IT support
* Most critical system
* Sensitive information
* Backup availability
* Reporting procedures
* Existing incident response practices
Based on these answers, JavaScript applies predefined conditions to select relevant recommendations and customize the incident response resources.
For example, if an organization does not have backups, Antzecure can identify this as an important security gap and provide guidance for improving recovery readiness.

Technologies Used
* HTML5 — Website structure
* CSS3 — Layout, styling, and responsive design
* JavaScript — Questionnaire logic, personalization, and interactive features
* NIST CSF 2.0 — Cybersecurity framework used to organize the assessment and recommendations
* Git & GitHub — Version control and project management

Getting Started
Requirements
You only need a modern web browser, such as Google Chrome, Safari, Firefox, or Microsoft Edge.
Python 3 is optional for running a local development server.
Installation
1. Clone the GitHub repository: git clone YOUR_REPOSITORY_URL
2. Navigate to the project directory: cd CyberReady
3. Start a local server: python3 -m http.server 8000
4. Open your browser and visit: http://localhost:8000
5. Complete the questionnaire to generate personalized cybersecurity resources.

How to Use Antzecure
1. Open the Antzecure website.
2. Enter your organization's information.
3. Complete the 20-question cybersecurity assessment.
4. Select Generate Readiness Recommendations.
5. Review your cybersecurity readiness summary and first steps.
6. Download your personalized recommendations and incident response plan.
7. Complete the Emergency Contact Card.
8. Practice your response using the 20-minute tabletop exercise.

 References

NIST Cybersecurity Framework (CSF) 2.0
https://www.nist.gov/cyberframework
NIST SP 800-61 Revision 3 — Incident Response Recommendations and Considerations
https://csrc.nist.gov/pubs/sp/800/61/r3/final
CISA — StopRansomware Guide
https://www.cisa.gov/stopransomware
These resources help guide the project's assessment structure, recommendations, and incident response content.



