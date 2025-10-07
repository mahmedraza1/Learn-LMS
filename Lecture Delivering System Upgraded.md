## General Rules
- The Courses got two batches batch a and a batch b.
- The batch a would be from 1st of a month to 27th of that month remaining days would be leaves and then batch would start again. The batch b would start from 16th of current month to the 12th of next moth and if month is 31 it would be a leave too.
- Total courses are  15 and everyday there would 15 lectures occurring if today date is odd there would be 8 lectures from batch  a and 7 lectures from batch b and if the date is even there would be 8 lectures from batch b and 7 lectures from batch a. 
- There would be no predefined lecture card in application instead there would be button in drop-down of each course on admin and instructor side saying add a lecture clicking it would open a popup form asking for lecture name, date of lecture and day of lecture would be calculated at real time if day is Friday don't allow lecture addition and say it's leave on Friday. and then it asks for a time of lecture at last link to YouTube live video. As lectures are added cards would increase. and based on previous cards added in the number auto give lecture number to this.
- Now when saving card save all the information like lecture number which would be prominent in User Interface and lecture name as it's subheading type then date of lecture and day of lecture and a attend button on student side. but on instructor and admin side the buttons would be edit that would keep the old info and allow editing in it in same form as of adding a lecture. there would be a preview button that would load the lecture same as attend button would do on student side. A delete button that would delete the card. and a delivered button when clicked the delivered button the button color would change somehow student can still get that lecture but it is not live now. The today lecture would be prominent how we know it is lecture today we would compare the date in that lecture with date.now() somehow and would give a shadow and prominence to that card. and prominence remain all day even after delivered is clicked by instructor.
- in each course drop-down there would be option for instructor and admin to add announcement which is shown above all the lectures added. it is place where instructor or admin can add any info they wanna share with students.
- For lecture prominence add one more thing make it's lecture card bigger than other somehow.
- and the course in which there is lecture today give it border or something to tell there is active lecture in this course.
## Classes Arrangement
This Section explain which lectures would be going to happen on what day.
### If Date is Odd
- Batch A lectures
	 - Video Editing 
	 - digital marketing
	 - WordPress  
	 - Search Engine Optimization 
	 - Affiliate Marketing 
	 - Amazon Virtual Assistant 
	 - Graphics Designing 
	 - Content Writing 
 - Batch B lectures
	 - Artificial Intelligence Prompt
	 - Full Stack Web Development
	 - Freelancing
	 - Shopify Dropshipping
	 - YouTube Creator
	 - MS Office and Digital Literacy
	 - English Language and Communication
### If Date is Even
- Batch A lectures
	- Artificial Intelligence Prompt
	 - Full Stack Web Development
	 - Freelancing
	 - Shopify Dropshipping
	 - YouTube Creator
	 - MS Office and Digital Literacy
	 - English Language and Communication
- Batch B lectures
	 - Video Editing 
	 - digital marketing
	 - WordPress  
	 - Search Engine Optimization 
	 - Affiliate Marketing 
	 - Amazon Virtual Assistant 
	 - Graphics Designing 
	 - Content Writing

### Time Setting
- We don't need to be worried about time it would be set manually as we gave the option in form of edit and add a lecture.

## Updated Implementation (October 2025)

### Course Highlighting Logic Changes
- **Previous Logic**: Courses were highlighted based on odd/even date rules regardless of actual scheduled lectures
- **New Logic**: Only courses with actual scheduled lectures for today are highlighted
- **Benefits**: 
  - More accurate user experience
  - Students see exactly what's available today
  - Instructors have full control over course visibility
  - No false positives for highlighted courses without lectures

### Course Organization Improvements
- **Priority Display**: Courses with today's lectures automatically appear at the top of dashboards
- **Visual Sections**: 
  - "📚 Today's Active Lectures" section with green "Live Now" badge for students
  - "🎯 Today's Active Lectures" section with "Manage Live" badge for admins
  - "📋 Tommorow's Courses" section for courses without today's lectures
- **Real-time Updates**: Course highlighting and organization update automatically when lectures are added/removed

### Responsive Design Enhancements
- **Improved Grid Layouts**: All card-based components now use optimized responsive breakpoints
- **Smart Breakpoint Progression**:
  - Mobile (0-640px): 1 card per row
  - Small screens (640-1280px): 2 cards per row
  - Large screens (1280-1536px): 3 cards per row
  - Extra large screens (1536px+): 4 cards per row
- **Better User Experience**: Smooth transitions prevent awkward spacing in mid-range screen sizes

### Technical Implementation
- **Data-driven Highlighting**: Uses actual lecture data from Redux state instead of date-based rules
- **Performance Optimized**: useMemo hooks prevent unnecessary re-calculations
- **Consistent Architecture**: All components follow the same responsive and highlighting patterns