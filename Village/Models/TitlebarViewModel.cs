namespace Village.Models
{
    public class TitlebarViewModel
    {
        public TitlebarViewModel(string title, string description)
        {
            Title = title;
            Description = description;
        }

        public string Title { get; set; }
        public string Description { get; set; }
    }
}
